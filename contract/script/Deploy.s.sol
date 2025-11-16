// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "forge-std/Script.sol";
import "../src/HYPEUSDXLOptimizer.sol";

/**
 * @title DeployScript
 * @notice Deploy HYPEUSDXLOptimizer to HyperEVM Testnet
 */
contract DeployScript is Script {
    // HyperEVM Testnet addresses
    address constant HYPURRFI_POOL = 0xceCcE0EB9DD2Ef7996e01e25DD70e461F918A14b;
    
    // TODO: Update these addresses after finding them on testnet
    address constant HYPE_TOKEN = 0x5555555555555555555555555555555555555555; // Wrapped HYPE (wHYPE)
    address constant USDXL_TOKEN = address(0); // USDXL address
    address constant DEFAULT_VALIDATOR = address(0); // Validator for HIP-3
    
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("========================================");
        console.log("Deploying HYPEUSDXLOptimizer");
        console.log("========================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Balance:", deployer.balance);
        console.log("");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy optimizer
        HYPEUSDXLOptimizer optimizer = new HYPEUSDXLOptimizer(
            HYPE_TOKEN,
            USDXL_TOKEN,
            HYPURRFI_POOL,
            DEFAULT_VALIDATOR
        );
        
        vm.stopBroadcast();
        
        // Log deployment info
        console.log("========================================");
        console.log("Deployment Complete!");
        console.log("========================================");
        console.log("HYPEUSDXLOptimizer:", address(optimizer));
        console.log("");
        console.log("Configuration:");
        console.log("- HYPE Token:", optimizer.HYPE());
        console.log("- USDXL Token:", optimizer.USDXL());
        console.log("- HypurrFi Pool:", address(optimizer.hypurrFiPool()));
        console.log("- Default Validator:", optimizer.defaultValidator());
        console.log("");
        console.log("Strategy Summary:");
        _logStrategies(optimizer);
        console.log("");
        console.log("Next steps:");
        console.log("1. Verify contract on explorer");
        console.log("2. Update frontend/.env.local with contract address");
        console.log("3. Test deposit on testnet");
        console.log("========================================");
    }
    
    function _logStrategies(HYPEUSDXLOptimizer optimizer) internal view {
        (
            HYPEUSDXLOptimizer.StrategyConfig memory stability,
            HYPEUSDXLOptimizer.StrategyConfig memory leverage,
            HYPEUSDXLOptimizer.StrategyConfig memory hybrid,
            HYPEUSDXLOptimizer.StrategyConfig memory hip3
        ) = optimizer.getAllStrategies();
        
        console.log("Strategy 1:", stability.name);
        console.log("  APR: %s.%s%%", stability.baseAPR / 100, stability.baseAPR % 100);
        console.log("  Min Deposit: %s HYPE", stability.minDeposit / 1e18);
        
        console.log("Strategy 2:", leverage.name);
        console.log("  APR: %s.%s%%", leverage.baseAPR / 100, leverage.baseAPR % 100);
        console.log("  Min Deposit: %s HYPE", leverage.minDeposit / 1e18);
        
        console.log("Strategy 3:", hybrid.name);
        console.log("  APR: %s.%s%%", hybrid.baseAPR / 100, hybrid.baseAPR % 100);
        console.log("  Min Deposit: %s HYPE", hybrid.minDeposit / 1e18);
        
        console.log("Strategy 4:", hip3.name);
        uint256 totalAPR = hip3.baseAPR + hip3.feeRebateAPR;
        console.log("  APR: %s.%s%%", totalAPR / 100, totalAPR % 100);
        console.log("  Min Deposit: %s HYPE", hip3.minDeposit / 1e18);
    }
}
