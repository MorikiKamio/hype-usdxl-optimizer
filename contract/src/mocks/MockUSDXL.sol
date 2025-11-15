// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDXL
 * @notice Mock USDXL token for testing purposes
 * @dev Mintable ERC20 for testnet demonstration
 */
contract MockUSDXL is ERC20, Ownable {
    constructor() ERC20("Mock USDXL", "USDXL") Ownable(msg.sender) {
        // Mint initial supply for testing
        _mint(msg.sender, 1_000_000 * 10**18); // 1M USDXL
    }
    
    /**
     * @notice Mint tokens (for testing)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @notice Faucet function - anyone can get test tokens
     * @dev Limited to 1000 USDXL per call
     */
    function faucet() external {
        require(balanceOf(msg.sender) < 10_000 * 10**18, "Already have enough");
        _mint(msg.sender, 1_000 * 10**18); // 1000 USDXL
    }
}
