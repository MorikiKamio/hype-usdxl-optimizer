// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IHypurrFiPool.sol";

contract MockHypurrFiPool is IHypurrFiPool {
    using SafeERC20 for IERC20;

    mapping(address => mapping(address => uint256)) public collateralBalances;
    mapping(address => mapping(address => uint256)) public debtBalances;
    mapping(address => uint256) public poolLiquidity;

    function fundPool(address asset, uint256 amount) external {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        poolLiquidity[asset] += amount;
    }

    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16
    ) external override {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        collateralBalances[onBehalfOf][asset] += amount;
        poolLiquidity[asset] += amount;
    }

    function borrow(
        address asset,
        uint256 amount,
        uint256,
        uint16,
        address onBehalfOf
    ) external override {
        require(poolLiquidity[asset] >= amount, "Insufficient liquidity");
        poolLiquidity[asset] -= amount;
        debtBalances[onBehalfOf][asset] += amount;
        IERC20(asset).safeTransfer(onBehalfOf, amount);
    }

    function repay(
        address asset,
        uint256 amount,
        uint256,
        address onBehalfOf
    ) external override returns (uint256) {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        uint256 debt = debtBalances[onBehalfOf][asset];
        if (amount > debt) {
            amount = debt;
        }
        debtBalances[onBehalfOf][asset] -= amount;
        poolLiquidity[asset] += amount;
        return amount;
    }

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external override returns (uint256) {
        uint256 balance = collateralBalances[msg.sender][asset];
        require(balance >= amount, "Insufficient collateral");
        collateralBalances[msg.sender][asset] -= amount;
        poolLiquidity[asset] -= amount;
        IERC20(asset).safeTransfer(to, amount);
        return amount;
    }

    function getUserAccountData(address)
        external
        pure
        override
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        // Simplified mock values
        return (0, 0, 0, 0, 0, 1e18);
    }
}
