import { Address } from 'viem';

export const OPTIMIZER_ADDRESS: Address = (process.env.NEXT_PUBLIC_OPTIMIZER_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as Address;
export const WHYPE_ADDRESS: Address = (process.env.NEXT_PUBLIC_WHYPE_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as Address;
export const USDXL_ADDRESS: Address = (process.env.NEXT_PUBLIC_USDXL_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as Address;
export const HYPURRFI_POOL_ADDRESS: Address = (process.env.NEXT_PUBLIC_HYPURRFI_POOL ||
  '0x0000000000000000000000000000000000000000') as Address;

// Lite optimizer ABI
export const OPTIMIZER_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getPosition',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'deposited', type: 'uint256' },
      { name: 'strategy', type: 'uint256' },
    ],
  },
  {
    name: 'positions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'deposited', type: 'uint256' },
      { name: 'strategy', type: 'uint256' },
    ],
  },
] as const;

// Minimal ERC20 ABI (WHYPE/USDXL)
export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

export enum StrategyType {
  Stability = 0,
  Leverage = 1,
}

export const HYPURRFI_POOL_ABI = [
  {
    name: 'getReserveData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      { name: 'availableLiquidity', type: 'uint256' },
      { name: 'totalDebt', type: 'uint256' },
      { name: 'liquidityRate', type: 'uint256' },
      { name: 'variableBorrowRate', type: 'uint256' },
    ],
  },
  {
    name: 'getUserAccountData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { type: 'uint256', name: 'totalCollateralBase' },
      { type: 'uint256', name: 'totalDebtBase' },
      { type: 'uint256', name: 'availableBorrowsBase' },
      { type: 'uint256', name: 'currentLiquidationThreshold' },
      { type: 'uint256', name: 'ltv' },
      { type: 'uint256', name: 'healthFactor' },
    ],
  },
] as const;
