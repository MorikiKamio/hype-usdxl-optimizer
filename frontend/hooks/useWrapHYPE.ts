'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { hyperliquidTestnet } from '@/app/providers';
import { HYPE_TOKEN_ADDRESS } from '@/lib/contracts';

const WHYPE_ADDRESS =
  (process.env.NEXT_PUBLIC_WHYPE_ADDRESS as `0x${string}`) || HYPE_TOKEN_ADDRESS;

const WHYPE_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'wad', type: 'uint256' }],
    outputs: [],
  },
] as const;

export function useWrapHYPE() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const wrap = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount');

    await writeContract({
      address: WHYPE_ADDRESS,
      abi: WHYPE_ABI,
      functionName: 'deposit',
      chain: hyperliquidTestnet,
      account: address,
      value: parseEther(amount),
    });
  };

  const unwrap = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount');

    await writeContract({
      address: WHYPE_ADDRESS,
      abi: WHYPE_ABI,
      functionName: 'withdraw',
      chain: hyperliquidTestnet,
      account: address,
      args: [parseEther(amount)],
    });
  };

  return {
    wrap,
    unwrap,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
