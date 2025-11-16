// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IHypurrFiPool.sol";
import "./interfaces/ICoreWriter.sol";

contract HYPEUSDXLOptimizerLite is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_BPS = 10_000;
    uint256 public constant HIP3_DEFAULT_MIN = 100 * 1e18;
    ICoreWriter public constant CORE_WRITER = ICoreWriter(0x3333333333333333333333333333333333333333);

    IERC20 public immutable HYPE;
    IERC20 public immutable USDXL;
    IHypurrFiPool public immutable POOL;

    uint256 public targetLtvBps = 7000; // 70%
    uint256 public maxLoops = 5;
    uint256 public minHealthFactor = 1_300_000_000_000_000_000; // 1.3

    uint256 public totalCollateral;
    uint256 public totalDebt;
    uint256 public totalShares;
    uint256 public totalHip3Deposits;
    uint256 public totalUsdxlCollateral;

    struct Position {
        uint256 shares;
    }

    mapping(address => Position) public positions;
    mapping(address => uint256) public hip3Deposits;
    mapping(address => uint256) public usdxlDeposits;

    address public hip3Validator;
    uint256 public hip3MinDeposit = HIP3_DEFAULT_MIN;

    event Deposit(address indexed user, uint256 amount, uint256 sharesMinted, uint256 loops);
    event Withdraw(address indexed user, uint256 amount, uint256 sharesBurned);
    event Hip3Deposit(address indexed user, uint256 amount);
    event Hip3Withdraw(address indexed user, uint256 amount);
    event UsdxlDeposit(address indexed user, uint256 amount);
    event UsdxlWithdraw(address indexed user, uint256 amount);
    event TargetLtvUpdated(uint256 targetLtvBps);
    event MaxLoopsUpdated(uint256 maxLoops);
    event MinHealthFactorUpdated(uint256 minHealthFactor);
    event Hip3ValidatorUpdated(address validator);
    event Hip3MinDepositUpdated(uint256 amount);

    constructor(address _hype, address _usdxl, address _pool) Ownable(msg.sender) {
        HYPE = IERC20(_hype);
        USDXL = IERC20(_usdxl);
        POOL = IHypurrFiPool(_pool);

        HYPE.forceApprove(address(POOL), 0);
        HYPE.forceApprove(address(POOL), type(uint256).max);
        USDXL.forceApprove(address(POOL), 0);
        USDXL.forceApprove(address(POOL), type(uint256).max);
    }

    function setTargetLtvBps(uint256 newTarget) external onlyOwner {
        require(newTarget > 0 && newTarget < 9000, "invalid target");
        targetLtvBps = newTarget;
        emit TargetLtvUpdated(newTarget);
    }

    function setMaxLoops(uint256 newMax) external onlyOwner {
        require(newMax > 0 && newMax <= 10, "invalid loops");
        maxLoops = newMax;
        emit MaxLoopsUpdated(newMax);
    }

    function setMinHealthFactor(uint256 newMin) external onlyOwner {
        require(newMin >= 1_100_000_000_000_000_000, "min too low");
        minHealthFactor = newMin;
        emit MinHealthFactorUpdated(newMin);
    }

    function setHip3Validator(address validator) external onlyOwner {
        hip3Validator = validator;
        emit Hip3ValidatorUpdated(validator);
    }

    function setHip3MinDeposit(uint256 amount) external onlyOwner {
        hip3MinDeposit = amount;
        emit Hip3MinDepositUpdated(amount);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "zero");

        HYPE.safeTransferFrom(msg.sender, address(this), amount);

        uint256 equityBefore = _equity();

        _supply(amount);
        totalCollateral += amount;

        uint256 loops = _leverageUp();

        uint256 equityAfter = _equity();
        require(equityAfter > equityBefore, "no equity gain");
        uint256 equityGain = equityAfter - equityBefore;

        uint256 sharesToMint = totalShares == 0 || equityBefore == 0
            ? equityGain
            : (equityGain * totalShares) / equityBefore;
        require(sharesToMint > 0, "zero shares");

        positions[msg.sender].shares += sharesToMint;
        totalShares += sharesToMint;

        emit Deposit(msg.sender, amount, sharesToMint, loops);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "zero");
        uint256 equity = _equity();
        require(equity >= amount, "insufficient equity");
        require(totalShares > 0, "no shares");

        Position storage pos = positions[msg.sender];
        require(pos.shares > 0, "no position");

        uint256 sharesToBurn = (amount * totalShares + equity - 1) / equity;
        require(pos.shares >= sharesToBurn, "insufficient shares");

        pos.shares -= sharesToBurn;
        totalShares -= sharesToBurn;

        uint256 collateralPortion = (totalCollateral * amount + equity - 1) / equity;
        uint256 debtPortion = (totalDebt * amount + equity - 1) / equity;

        (uint256 withdrawn, uint256 repaid) = _withdrawAndRepay(collateralPortion, debtPortion);
        require(withdrawn >= repaid, "invalid repayment");

        uint256 payout = withdrawn - repaid;
        require(payout >= amount, "redeem failed");
        HYPE.safeTransfer(msg.sender, payout);

        emit Withdraw(msg.sender, amount, sharesToBurn);
    }

    function getPosition(address user)
        external
        view
        returns (
            uint256 equityPortion,
            uint256 shares,
            uint256 collateralPortion,
            uint256 debtPortion,
            uint256 ltvBps
        )
    {
        shares = positions[user].shares;
        if (shares == 0 || totalShares == 0) {
            return (0, shares, 0, 0, 0);
        }

        uint256 equity = _equity();
        equityPortion = equity == 0 ? 0 : (shares * equity) / totalShares;
        collateralPortion = (shares * totalCollateral) / totalShares;
        debtPortion = (shares * totalDebt) / totalShares;
        ltvBps = collateralPortion == 0 ? 0 : (debtPortion * MAX_BPS) / collateralPortion;
    }

    function getHip3Position(address user)
        external
        view
        returns (
            uint256 deposited,
            uint256 totalDeposited,
            uint256 minDeposit,
            address validator
        )
    {
        return (hip3Deposits[user], totalHip3Deposits, hip3MinDeposit, hip3Validator);
    }

    function getUsdxlPosition(address user)
        external
        view
        returns (uint256 deposited, uint256 totalDeposited)
    {
        return (usdxlDeposits[user], totalUsdxlCollateral);
    }

    function _leverageUp() internal returns (uint256 loops) {
        while (loops < maxLoops) {
            if (totalCollateral == 0) {
                break;
            }

            uint256 currentLtv = _currentLtvBps();
            if (currentLtv >= targetLtvBps) {
                break;
            }

            uint256 targetDebt = (totalCollateral * targetLtvBps) / MAX_BPS;
            if (targetDebt <= totalDebt) {
                break;
            }

            uint256 borrowAmount = targetDebt - totalDebt;
            if (borrowAmount == 0) {
                break;
            }

            _borrowAndSupply(borrowAmount);
            loops++;

            _ensureHealth();
        }
    }

    function _withdrawAndRepay(uint256 collateralAmount, uint256 debtAmount)
        internal
        returns (uint256 withdrawn, uint256 repaid)
    {
        if (collateralAmount > 0) {
            withdrawn = POOL.withdraw(address(HYPE), collateralAmount, address(this));
            totalCollateral -= withdrawn;
        }

        if (debtAmount > 0) {
            repaid = POOL.repay(address(HYPE), debtAmount, 2, address(this));
            totalDebt -= repaid;
        }

        if (totalCollateral > 0 || totalDebt > 0) {
            _ensureHealth();
        }
    }

    function _borrowAndSupply(uint256 amount) internal {
        POOL.borrow(address(HYPE), amount, 2, 0, address(this));
        totalDebt += amount;
        _supply(amount);
        totalCollateral += amount;
    }

    function depositHip3(uint256 amount) external nonReentrant {
        require(hip3Validator != address(0), "validator unset");
        require(amount >= hip3MinDeposit, "below min");
        HYPE.safeTransferFrom(msg.sender, address(this), amount);
        _delegateToHip3(amount);
        hip3Deposits[msg.sender] += amount;
        totalHip3Deposits += amount;
        emit Hip3Deposit(msg.sender, amount);
    }

    function withdrawHip3(uint256 amount) external nonReentrant {
        require(amount > 0, "zero");
        uint256 balance = hip3Deposits[msg.sender];
        require(balance >= amount, "insufficient");
        hip3Deposits[msg.sender] = balance - amount;
        totalHip3Deposits -= amount;
        require(CORE_WRITER.undelegateHYPE(hip3Validator, amount), "undelegate fail");
        HYPE.safeTransfer(msg.sender, amount);
        emit Hip3Withdraw(msg.sender, amount);
    }

    function _delegateToHip3(uint256 amount) internal {
        HYPE.forceApprove(address(CORE_WRITER), amount);
        require(CORE_WRITER.delegateHYPE(hip3Validator, amount), "delegate fail");
    }

    function depositUsdxl(uint256 amount) external nonReentrant {
        require(amount > 0, "zero");
        USDXL.safeTransferFrom(msg.sender, address(this), amount);
        POOL.supply(address(USDXL), amount, address(this), 0);
        usdxlDeposits[msg.sender] += amount;
        totalUsdxlCollateral += amount;
        emit UsdxlDeposit(msg.sender, amount);
    }

    function withdrawUsdxl(uint256 amount) external nonReentrant {
        require(amount > 0, "zero");
        uint256 balance = usdxlDeposits[msg.sender];
        require(balance >= amount, "insufficient");
        usdxlDeposits[msg.sender] = balance - amount;
        totalUsdxlCollateral -= amount;
        POOL.withdraw(address(USDXL), amount, address(this));
        USDXL.safeTransfer(msg.sender, amount);
        emit UsdxlWithdraw(msg.sender, amount);
    }

    function _supply(uint256 amount) internal {
        POOL.supply(address(HYPE), amount, address(this), 0);
    }

    function _currentLtvBps() internal view returns (uint256) {
        if (totalCollateral == 0) {
            return 0;
        }
        return (totalDebt * MAX_BPS) / totalCollateral;
    }

    function _equity() internal view returns (uint256) {
        return totalCollateral > totalDebt ? totalCollateral - totalDebt : 0;
    }

    function _ensureHealth() internal view {
        (, , , , , uint256 healthFactor) = POOL.getUserAccountData(address(this));
        require(healthFactor >= minHealthFactor, "health too low");
    }
}
