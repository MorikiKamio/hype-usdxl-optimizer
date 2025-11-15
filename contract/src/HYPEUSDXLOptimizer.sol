// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./interfaces/IHypurrFiPool.sol";
import "./interfaces/ICoreWriter.sol";

/**
 * @title HYPEUSDXLOptimizer
 * @notice Multi-Strategy Yield Optimizer powered by HypurrFi
 * @dev Integrates 4 strategies: USDXL Stability, HYPE Leverage, Hybrid Multi-Asset, CoreWriter HIP-3
 */
contract HYPEUSDXLOptimizer is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                ENUMS
    //////////////////////////////////////////////////////////////*/
    
    enum StrategyType {
        USDXL_STABILITY,      // USDXL Carry Trade (Low Risk, 3-5% APR)
        HYPE_LEVERAGE,        // HYPE 3x Loop (High Risk, 18% APR)
        HYBRID_MULTI_ASSET,   // HYPE+USDXL Diversified (Medium Risk, 12-15% APR)
        CORE_WRITER_HIP3      // Direct Delegation (Low Risk, 6% APR, 500K min)
    }

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    struct StrategyConfig {
        string name;
        uint256 baseAPR;
        uint256 feeRebateAPR;
        uint256 minDeposit;
        uint256 totalDeposited;
        bool isActive;
    }
    
    struct UserPosition {
        uint256 shares;
        uint256 hypeCollateral;
        uint256 usdxlCollateral;
        uint256 usdxlDebt;
        uint256 hip3Delegated;
        StrategyType activeStrategy;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    
    address public immutable HYPE;
    address public immutable USDXL;
    
    IHypurrFiPool public immutable hypurrFiPool;
    ICoreWriter public constant CORE_WRITER = ICoreWriter(0x3333333333333333333333333333333333333333);
    
    mapping(StrategyType => StrategyConfig) public strategies;
    mapping(address => UserPosition) public positions;
    
    uint256 public totalShares;
    address public defaultValidator;
    
    uint256 public constant MAX_LTV = 7500;
    uint256 public constant CONSERVATIVE_LTV = 5000;
    uint256 public constant MIN_HEALTH_FACTOR = 1.3e18;
    uint256 public constant TARGET_HEALTH_FACTOR = 1.5e18;
    uint256 public constant TARGET_LEVERAGE = 3;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    event Deposited(address indexed user, uint256 amount, StrategyType strategy, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned);
    event StrategyExecuted(address indexed user, StrategyType strategy, uint256 hypeCollateral, uint256 usdxlCollateral, uint256 usdxlDebt);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    error ZeroAmount();
    error StrategyInactive();
    error BelowMinimumDeposit(uint256 required, uint256 provided);
    error InsufficientShares();
    error HealthFactorTooLow(uint256 healthFactor);
    error InvalidStrategy();

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    constructor(
        address _hype,
        address _usdxl,
        address _hypurrFiPool,
        address _defaultValidator
    ) Ownable(msg.sender) {
        HYPE = _hype;
        USDXL = _usdxl;
        hypurrFiPool = IHypurrFiPool(_hypurrFiPool);
        defaultValidator = _defaultValidator;
        
        _initializeStrategies();
    }
    
    function _initializeStrategies() internal {
        strategies[StrategyType.USDXL_STABILITY] = StrategyConfig({
            name: "USDXL Stability Farming",
            baseAPR: 400,
            feeRebateAPR: 0,
            minDeposit: 0,
            totalDeposited: 0,
            isActive: true
        });
        
        strategies[StrategyType.HYPE_LEVERAGE] = StrategyConfig({
            name: "HYPE 3x Leverage Loop",
            baseAPR: 1800,
            feeRebateAPR: 0,
            minDeposit: 0,
            totalDeposited: 0,
            isActive: true
        });
        
        strategies[StrategyType.HYBRID_MULTI_ASSET] = StrategyConfig({
            name: "Hybrid Multi-Asset Portfolio",
            baseAPR: 1200,
            feeRebateAPR: 0,
            minDeposit: 0,
            totalDeposited: 0,
            isActive: true
        });
        
        strategies[StrategyType.CORE_WRITER_HIP3] = StrategyConfig({
            name: "HIP-3 HYPE Delegation",
            baseAPR: 400,
            feeRebateAPR: 200,
            minDeposit: 500_000 * 1e18,
            totalDeposited: 0,
            isActive: true
        });
    }

    /*//////////////////////////////////////////////////////////////
                        DEPOSIT FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function depositAuto(uint256 amount) external nonReentrant returns (uint256 shares) {
        if (amount == 0) revert ZeroAmount();
        
        StrategyType optimal = selectOptimalStrategy(amount);
        shares = _deposit(amount, optimal);
        
        emit Deposited(msg.sender, amount, optimal, shares);
    }
    
    function depositToStrategy(uint256 amount, StrategyType strategy) 
        external 
        nonReentrant 
        returns (uint256 shares) 
    {
        if (amount == 0) revert ZeroAmount();
        
        StrategyConfig memory config = strategies[strategy];
        if (!config.isActive) revert StrategyInactive();
        if (amount < config.minDeposit) {
            revert BelowMinimumDeposit(config.minDeposit, amount);
        }
        
        shares = _deposit(amount, strategy);
        
        emit Deposited(msg.sender, amount, strategy, shares);
    }
    
    function _deposit(uint256 amount, StrategyType strategy) internal returns (uint256 shares) {
        IERC20(HYPE).safeTransferFrom(msg.sender, address(this), amount);
        
        shares = amount;
        totalShares += shares;
        
        UserPosition storage position = positions[msg.sender];
        position.shares += shares;
        position.activeStrategy = strategy;
        
        if (strategy == StrategyType.USDXL_STABILITY) {
            _executeStabilityStrategy(amount, msg.sender);
        } else if (strategy == StrategyType.HYPE_LEVERAGE) {
            _executeLeverageStrategy(amount, msg.sender);
        } else if (strategy == StrategyType.HYBRID_MULTI_ASSET) {
            _executeHybridStrategy(amount, msg.sender);
        } else if (strategy == StrategyType.CORE_WRITER_HIP3) {
            _executeHIP3Strategy(amount, msg.sender);
        } else {
            revert InvalidStrategy();
        }
        
        strategies[strategy].totalDeposited += amount;
    }

    /*//////////////////////////////////////////////////////////////
                    STRATEGY EXECUTION
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Execute USDXL Stability Farming strategy
     * @dev Supply HYPE → Borrow USDXL → Re-supply USDXL
     */
    function _executeStabilityStrategy(uint256 amount, address user) internal {
        // Step 1: Supply HYPE as collateral
        IERC20(HYPE).forceApprove(address(hypurrFiPool), amount);
        hypurrFiPool.supply(HYPE, amount, address(this), 0);
        
        // Step 2: Borrow USDXL (75% LTV)
        uint256 usdxlBorrowAmount = (amount * MAX_LTV) / 10000;
        hypurrFiPool.borrow(USDXL, usdxlBorrowAmount, 2, 0, address(this));
        
        // Step 3: Re-supply USDXL as additional collateral
        IERC20(USDXL).forceApprove(address(hypurrFiPool), usdxlBorrowAmount);
        hypurrFiPool.supply(USDXL, usdxlBorrowAmount, address(this), 0);
        
        // Step 4: Verify health factor
        (,,,,, uint256 healthFactor) = hypurrFiPool.getUserAccountData(address(this));
        if (healthFactor < MIN_HEALTH_FACTOR) {
            revert HealthFactorTooLow(healthFactor);
        }
        
        // Update user position
        positions[user].hypeCollateral += amount;
        positions[user].usdxlCollateral += usdxlBorrowAmount;
        positions[user].usdxlDebt += usdxlBorrowAmount;
        
        emit StrategyExecuted(user, StrategyType.USDXL_STABILITY, amount, usdxlBorrowAmount, usdxlBorrowAmount);
    }
    
    /**
     * @notice Execute HYPE 3x Leverage Loop strategy
     */
    function _executeLeverageStrategy(uint256 amount, address user) internal {
        uint256 totalHYPECollateral = 0;
        uint256 totalUSDXLDebt = 0;
        uint256 currentAmount = amount;
        
        for (uint256 i = 0; i < TARGET_LEVERAGE; i++) {
            IERC20(HYPE).forceApprove(address(hypurrFiPool), currentAmount);
            hypurrFiPool.supply(HYPE, currentAmount, address(this), 0);
            totalHYPECollateral += currentAmount;
            
            if (i == TARGET_LEVERAGE - 1) break;
            
            uint256 borrowAmount = (currentAmount * MAX_LTV) / 10000;
            hypurrFiPool.borrow(USDXL, borrowAmount, 2, 0, address(this));
            totalUSDXLDebt += borrowAmount;
            
            currentAmount = borrowAmount;
            
            (,,,,, uint256 healthFactor) = hypurrFiPool.getUserAccountData(address(this));
            if (healthFactor < MIN_HEALTH_FACTOR) {
                revert HealthFactorTooLow(healthFactor);
            }
        }
        
        positions[user].hypeCollateral += totalHYPECollateral;
        positions[user].usdxlDebt += totalUSDXLDebt;
        
        emit StrategyExecuted(user, StrategyType.HYPE_LEVERAGE, totalHYPECollateral, 0, totalUSDXLDebt);
    }
    
    /**
     * @notice Execute Hybrid Multi-Asset strategy
     */
    function _executeHybridStrategy(uint256 amount, address user) internal {
        IERC20(HYPE).forceApprove(address(hypurrFiPool), amount);
        hypurrFiPool.supply(HYPE, amount, address(this), 0);
        
        uint256 initialBorrow = (amount * CONSERVATIVE_LTV) / 10000;
        hypurrFiPool.borrow(USDXL, initialBorrow, 2, 0, address(this));
        
        IERC20(USDXL).forceApprove(address(hypurrFiPool), initialBorrow);
        hypurrFiPool.supply(USDXL, initialBorrow, address(this), 0);
        
        (,,uint256 availableBorrows,,,) = hypurrFiPool.getUserAccountData(address(this));
        
        uint256 additionalBorrow = availableBorrows / 2;
        if (additionalBorrow > 0) {
            hypurrFiPool.borrow(USDXL, additionalBorrow, 2, 0, address(this));
            IERC20(USDXL).forceApprove(address(hypurrFiPool), additionalBorrow);
            hypurrFiPool.supply(USDXL, additionalBorrow, address(this), 0);
        }
        
        (,,,,, uint256 healthFactor) = hypurrFiPool.getUserAccountData(address(this));
        if (healthFactor < MIN_HEALTH_FACTOR) {
            revert HealthFactorTooLow(healthFactor);
        }
        
        uint256 totalUSDXL = initialBorrow + additionalBorrow;
        
        positions[user].hypeCollateral += amount;
        positions[user].usdxlCollateral += totalUSDXL;
        positions[user].usdxlDebt += totalUSDXL;
        
        emit StrategyExecuted(user, StrategyType.HYBRID_MULTI_ASSET, amount, totalUSDXL, totalUSDXL);
    }
    
    /**
     * @notice Execute CoreWriter HIP-3 Delegation strategy
     */
    function _executeHIP3Strategy(uint256 amount, address user) internal {
        IERC20(HYPE).forceApprove(address(CORE_WRITER), amount);
        
        bool success = CORE_WRITER.delegateHYPE(defaultValidator, amount);
        require(success, "HIP-3 delegation failed");
        
        positions[user].hip3Delegated += amount;
        
        emit StrategyExecuted(user, StrategyType.CORE_WRITER_HIP3, 0, 0, 0);
    }

    /*//////////////////////////////////////////////////////////////
                        WITHDRAWAL LOGIC
    //////////////////////////////////////////////////////////////*/
    
    function withdraw(uint256 shares) external nonReentrant returns (uint256 amount) {
        UserPosition storage position = positions[msg.sender];
        
        if (shares > position.shares) revert InsufficientShares();
        if (shares == 0) revert ZeroAmount();
        
        uint256 totalAmount = 0;
        uint256 shareRatio = (shares * 1e18) / position.shares;
        
        if (position.hypeCollateral > 0 || position.usdxlCollateral > 0) {
            uint256 recovered = _unwindHypurrFiPosition(msg.sender, shareRatio);
            totalAmount += recovered;
        }
        
        if (position.hip3Delegated > 0) {
            uint256 toUndelegate = (position.hip3Delegated * shareRatio) / 1e18;
            bool success = CORE_WRITER.undelegateHYPE(defaultValidator, toUndelegate);
            if (success) {
                totalAmount += toUndelegate;
                position.hip3Delegated -= toUndelegate;
            }
        }
        
        position.shares -= shares;
        totalShares -= shares;
        
        IERC20(HYPE).safeTransfer(msg.sender, totalAmount);
        
        emit Withdrawn(msg.sender, totalAmount, shares);
        
        return totalAmount;
    }
    
    function _unwindHypurrFiPosition(address user, uint256 shareRatio) internal returns (uint256 recovered) {
        UserPosition storage position = positions[user];
        
        uint256 hypeToWithdraw = (position.hypeCollateral * shareRatio) / 1e18;
        uint256 usdxlToRepay = (position.usdxlDebt * shareRatio) / 1e18;
        
        if (usdxlToRepay > 0) {
            uint256 hypeForRepay = usdxlToRepay;
            hypurrFiPool.withdraw(HYPE, hypeForRepay, address(this));
            
            IERC20(USDXL).forceApprove(address(hypurrFiPool), usdxlToRepay);
            hypurrFiPool.repay(USDXL, usdxlToRepay, 2, address(this));
            
            position.usdxlDebt -= usdxlToRepay;
            hypeToWithdraw -= hypeForRepay;
        }
        
        if (hypeToWithdraw > 0) {
            recovered = hypurrFiPool.withdraw(HYPE, hypeToWithdraw, address(this));
            position.hypeCollateral -= hypeToWithdraw;
        }
        
        uint256 usdxlCollateralToWithdraw = (position.usdxlCollateral * shareRatio) / 1e18;
        if (usdxlCollateralToWithdraw > 0) {
            uint256 usdxlWithdrawn = hypurrFiPool.withdraw(USDXL, usdxlCollateralToWithdraw, address(this));
            recovered += usdxlWithdrawn;
            position.usdxlCollateral -= usdxlCollateralToWithdraw;
        }
    }

    /*//////////////////////////////////////////////////////////////
                        STRATEGY SELECTION
    //////////////////////////////////////////////////////////////*/
    
    function selectOptimalStrategy(uint256 amount) public view returns (StrategyType optimal) {
        uint256 maxAPR = 0;
        
        for (uint256 i = 0; i < 4; i++) {
            StrategyType sType = StrategyType(i);
            StrategyConfig memory config = strategies[sType];
            
            if (!config.isActive || amount < config.minDeposit) continue;
            
            uint256 totalAPR = config.baseAPR + config.feeRebateAPR;
            
            if (totalAPR > maxAPR) {
                maxAPR = totalAPR;
                optimal = sType;
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function getUserPosition(address user) external view returns (UserPosition memory) {
        return positions[user];
    }
    
    function getStrategyConfig(StrategyType strategy) external view returns (StrategyConfig memory) {
        return strategies[strategy];
    }
    
    function getAllStrategies() external view returns (
        StrategyConfig memory stability,
        StrategyConfig memory leverage,
        StrategyConfig memory hybrid,
        StrategyConfig memory hip3
    ) {
        return (
            strategies[StrategyType.USDXL_STABILITY],
            strategies[StrategyType.HYPE_LEVERAGE],
            strategies[StrategyType.HYBRID_MULTI_ASSET],
            strategies[StrategyType.CORE_WRITER_HIP3]
        );
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function setDefaultValidator(address newValidator) external onlyOwner {
        defaultValidator = newValidator;
    }
    
    function setStrategyActive(StrategyType strategy, bool active) external onlyOwner {
        strategies[strategy].isActive = active;
    }
}
