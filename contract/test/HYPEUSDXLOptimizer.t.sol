// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "forge-std/Test.sol";
import "../src/HYPEUSDXLOptimizer.sol";
import "../src/interfaces/IHypurrFiPool.sol";

contract HYPEUSDXLOptimizerTest is Test {
    HYPEUSDXLOptimizer public optimizer;
    
    // Mock addresses (will use actual addresses for fork test)
    address constant HYPE = address(0x1);
    address constant USDXL = address(0x2);
    address constant HYPURRFI_POOL = 0xceCcE0EB9DD2Ef7996e01e25DD70e461F918A14b;
    address constant DEFAULT_VALIDATOR = address(0x999);
    
    address public user = address(0x123);
    
    function setUp() public {
        // Deploy optimizer
        optimizer = new HYPEUSDXLOptimizer(
            HYPE,
            USDXL,
            HYPURRFI_POOL,
            DEFAULT_VALIDATOR
        );
        
        // Label addresses for better traces
        vm.label(HYPE, "HYPE");
        vm.label(USDXL, "USDXL");
        vm.label(HYPURRFI_POOL, "HypurrFiPool");
        vm.label(user, "User");
        vm.label(address(optimizer), "Optimizer");
    }
    
    function testConstructor() public view {
        assertEq(optimizer.HYPE(), HYPE);
        assertEq(optimizer.USDXL(), USDXL);
        assertEq(address(optimizer.hypurrFiPool()), HYPURRFI_POOL);
        assertEq(optimizer.defaultValidator(), DEFAULT_VALIDATOR);
    }
    
    function testConstants() public view {
        assertEq(optimizer.MAX_LTV(), 7500);
        assertEq(optimizer.MIN_HEALTH_FACTOR(), 1.3e18);
        assertEq(optimizer.TARGET_HEALTH_FACTOR(), 1.5e18);
        assertEq(optimizer.TARGET_LEVERAGE(), 3);
    }
    
    function testStrategyInitialization() public view {
        HYPEUSDXLOptimizer.StrategyConfig memory config = optimizer.getStrategyConfig(HYPEUSDXLOptimizer.StrategyType.USDXL_STABILITY);
        
        assertEq(config.name, "USDXL Stability Farming");
        assertEq(config.baseAPR, 400);
        assertEq(config.feeRebateAPR, 0);
        assertEq(config.minDeposit, 0);
        assertEq(config.totalDeposited, 0);
        assertTrue(config.isActive);
    }
    
    function testSelectOptimalStrategy() public view {
        // With 100 HYPE, should select HYPE_LEVERAGE (highest APR: 18%)
        HYPEUSDXLOptimizer.StrategyType optimal = optimizer.selectOptimalStrategy(100 ether);
        assertEq(uint8(optimal), uint8(HYPEUSDXLOptimizer.StrategyType.HYPE_LEVERAGE));
    }
    
    function testSelectOptimalStrategyWithLargeAmount() public view {
        // With 500K+ HYPE, HIP-3 might be optimal if considering fee rebates
        HYPEUSDXLOptimizer.StrategyType optimal = optimizer.selectOptimalStrategy(500_000 ether);
        // HYPE_LEVERAGE (1800) > HIP3 (400+200=600)
        assertEq(uint8(optimal), uint8(HYPEUSDXLOptimizer.StrategyType.HYPE_LEVERAGE));
    }
    
    // Note: Full integration tests require forking HyperEVM testnet
    // These will be added in the next step
}
