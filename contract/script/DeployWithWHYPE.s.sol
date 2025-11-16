// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "forge-std/Script.sol";
import "../src/HYPEUSDXLOptimizer.sol";
import "../src/mocks/MockUSDXL.sol";
import "../src/mocks/MockHypurrFiPool.sol";
import "../src/mocks/WrappedHYPE.sol";

contract DeployWithWHYPEScript is Script {
    address constant DEFAULT_VALIDATOR = address(0);

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("========================================");
        console.log("Deploying with Wrapped HYPE");
        console.log("========================================");
        console.log("Deployer:", deployer);
        console.log("Native HYPE Balance:", deployer.balance / 1e18);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        console.log("Step 1: Deploying WrappedHYPE (WHYPE)...");
        WrappedHYPE whype = new WrappedHYPE();
        console.log("WHYPE:", address(whype));
        console.log("");

        console.log("Step 2: Deploying MockUSDXL...");
        MockUSDXL usdxl = new MockUSDXL();
        console.log("MockUSDXL:", address(usdxl));
        console.log("");

        console.log("Step 3: Deploying MockHypurrFiPool...");
        MockHypurrFiPool hypurrFi = new MockHypurrFiPool();
        console.log("MockHypurrFiPool:", address(hypurrFi));
        console.log("");

        console.log("Step 4: Funding pool...");
        uint256 liquidityAmount = 500_000 * 1e18;
        usdxl.mint(deployer, liquidityAmount);
        usdxl.approve(address(hypurrFi), liquidityAmount);
        hypurrFi.fundPool(address(usdxl), liquidityAmount);
        console.log("Pool funded with", liquidityAmount / 1e18, "USDXL");
        console.log("");

        console.log("Step 5: Deploying HYPEUSDXLOptimizer...");
        HYPEUSDXLOptimizer optimizer = new HYPEUSDXLOptimizer(
            address(whype),
            address(usdxl),
            address(hypurrFi),
            DEFAULT_VALIDATOR
        );
        console.log("HYPEUSDXLOptimizer:", address(optimizer));
        console.log("");

        usdxl.mint(deployer, 10_000 * 1e18);
        console.log("Minted 10,000 USDXL to deployer");

        vm.stopBroadcast();

        console.log("========================================");
        console.log("Deployment Complete!");
        console.log("========================================");
        console.log("WrappedHYPE (WHYPE): ", address(whype));
        console.log("MockUSDXL:           ", address(usdxl));
        console.log("MockHypurrFiPool:    ", address(hypurrFi));
        console.log("HYPEUSDXLOptimizer:  ", address(optimizer));
        console.log("");
        console.log("Update frontend/.env.local with:");
        console.log("NEXT_PUBLIC_WHYPE_ADDRESS=", address(whype));
        console.log("NEXT_PUBLIC_OPTIMIZER_ADDRESS=", address(optimizer));
        console.log("NEXT_PUBLIC_MOCK_USDXL_ADDRESS=", address(usdxl));
        console.log("");
        console.log("Workflow:");
        console.log("- Users see native HYPE balance");
        console.log("- Click Wrap & Deposit to convert to WHYPE");
        console.log("- Deposit executes optimizer strategy");
        console.log("========================================");
    }
}
