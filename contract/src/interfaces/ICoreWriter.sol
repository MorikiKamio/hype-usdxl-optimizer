// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

interface ICoreWriter {
    function delegateHYPE(address validator, uint256 amount) external returns (bool);
    function undelegateHYPE(address validator, uint256 amount) external returns (bool);
}
