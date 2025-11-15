import { Address } from 'viem';

// Contract Addresses (モック - デプロイ後に更新)
export const OPTIMIZER_ADDRESS: Address = '0x0000000000000000000000000000000000000000';
export const MOCK_USDXL_ADDRESS: Address = '0x0000000000000000000000000000000000000000';
export const HYPE_TOKEN_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

// Simplified ABI for frontend
export const OPTIMIZER_ABI = [
  {
    name: 'depositAuto',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'depositToStrategy',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'strategy', type: 'uint8' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: 'amount', type: 'uint256' }],
  },
  {
    name: 'getUserPosition',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'shares', type: 'uint256' },
          { name: 'hypeCollateral', type: 'uint256' },
          { name: 'usdxlCollateral', type: 'uint256' },
          { name: 'usdxlDebt', type: 'uint256' },
          { name: 'hip3Delegated', type: 'uint256' },
          { name: 'activeStrategy', type: 'uint8' },
        ],
      },
    ],
  },
  {
    name: 'selectOptimalStrategy',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'totalShares',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// ERC20 ABI (HYPE token)
export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Strategy Enum
export enum StrategyType {
  USDXL_STABILITY = 0,
  HYPE_LEVERAGE = 1,
  HYBRID_MULTI_ASSET = 2,
  CORE_WRITER_HIP3 = 3,
}
