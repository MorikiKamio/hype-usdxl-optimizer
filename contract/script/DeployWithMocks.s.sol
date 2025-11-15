// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "forge-std/Script.sol";
import "../src/HYPEUSDXLOptimizer.sol";
import "../src/mocks/MockUSDXL.sol";

/**
 * @title DeployWithMocksScript
 * @notice Deploy HYPEUSDXLOptimizer with mock USDXL to HyperEVM Testnet
 */
contract DeployWithMocksScript is Script {
    // HyperEVM Testnet addresses
    address constant HYPURRFI_POOL = 0xceCcE0EB9DD2Ef7996e01e25DD70e461F918A14b;
    
    // HYPE is native token on HyperEVM
    address constant HYPE_TOKEN = address(0); // Use address(0) for native token
    
    // Placeholder validator address (can be updated later)
    address constant DEFAULT_VALIDATOR = 0x0000000000000000000000000000000000000001;
    
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("========================================");
        console.log("Deploying Mock USDXL + HYPEUSDXLOptimizer");
        console.log("========================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Balance:", deployer.balance / 1e18, "HYPE");
        console.log("");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy mock USDXL first
        console.log("Deploying MockUSDXL...");
        MockUSDXL mockUSDXL = new MockUSDXL();
        console.log("MockUSDXL deployed at:", address(mockUSDXL));
        console.log("");
        
        // Deploy optimizer with mock USDXL
        console.log("Deploying HYPEUSDXLOptimizer...");
        HYPEUSDXLOptimizer optimizer = new HYPEUSDXLOptimizer(
            HYPE_TOKEN,
            address(mockUSDXL),
            HYPURRFI_POOL,
            DEFAULT_VALIDATOR
        );
        console.log("HYPEUSDXLOptimizer deployed at:", address(optimizer));
        
        vm.stopBroadcast();
        
        // Log deployment info
        console.log("");
        console.log("========================================");
        console.log("Deployment Complete!");
        console.log("========================================");
        console.log("MockUSDXL:", address(mockUSDXL));
        console.log("HYPEUSDXLOptimizer:", address(optimizer));
        console.log("");
        console.log("Configuration:");
        console.log("- HYPE Token: NATIVE (address(0))");
        console.log("- USDXL Token:", address(mockUSDXL));
        console.log("- HypurrFi Pool:", HYPURRFI_POOL);
        console.log("- Default Validator:", DEFAULT_VALIDATOR);
        console.log("");
        console.log("Next steps:");
        console.log("1. Get test USDXL: cast send", address(mockUSDXL), '"faucet()"');
        console.log("2. Update frontend/.env.local:");
        console.log("   NEXT_PUBLIC_OPTIMIZER_ADDRESS=", address(optimizer));
        console.log("   NEXT_PUBLIC_USDXL_ADDRESS=", address(mockUSDXL));
        console.log("3. Test deposit on testnet");
        console.log("========================================");
    }
}
