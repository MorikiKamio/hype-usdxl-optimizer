'use client';

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import {
  OPTIMIZER_ADDRESS,
  OPTIMIZER_ABI,
  ERC20_ABI,
  HYPE_TOKEN_ADDRESS,
} from '@/lib/contracts';
import { STRATEGIES } from '@/lib/types';

// Get user position from contract
export function useUserPosition(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: OPTIMIZER_ADDRESS,
    abi: OPTIMIZER_ABI,
    functionName: 'getUserPosition',
    args: address ? [address] : undefined,
    query: {
      enabled:
        !!address &&
        OPTIMIZER_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  // Transform contract data to UI format
  const position = data
    ? {
        shares: data.shares,
        hypeCollateral: Number(formatEther(data.hypeCollateral)),
        usdxlCollateral: Number(formatEther(data.usdxlCollateral)),
        usdxlDebt: Number(formatEther(data.usdxlDebt)),
        hip3Delegated: Number(formatEther(data.hip3Delegated)),
        activeStrategy: STRATEGIES[data.activeStrategy]?.name || 'Unknown',
        currentAPR: STRATEGIES[data.activeStrategy]?.apr || 0,
        deposited: Number(
          formatEther(data.hypeCollateral + data.usdxlCollateral + data.hip3Delegated),
        ),
        healthFactor: 1.45, // TODO: Calculate from HypurrFi
      }
    : null;

  return {
    position,
    isLoading,
    error,
    refetch,
  };
}

// Get HYPE token balance
export function useHYPEBalance(address: Address | undefined) {
  const { data, isLoading } = useReadContract({
    address: HYPE_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled:
        !!address &&
        HYPE_TOKEN_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    balance: data ? Number(formatEther(data)) : 0,
    isLoading,
  };
}

// Deposit functions
export function useDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const depositAuto = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }

    await writeContract({
      address: OPTIMIZER_ADDRESS,
      abi: OPTIMIZER_ABI,
      functionName: 'depositAuto',
      args: [parseEther(amount)],
    });
  };

  const depositToStrategy = async (amount: string, strategyIndex: number) => {
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }

    await writeContract({
      address: OPTIMIZER_ADDRESS,
      abi: OPTIMIZER_ABI,
      functionName: 'depositToStrategy',
      args: [parseEther(amount), strategyIndex],
    });
  };

  return {
    depositAuto,
    depositToStrategy,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Approve HYPE token
export function useApprove() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (amount: string) => {
    await writeContract({
      address: HYPE_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [OPTIMIZER_ADDRESS, parseEther(amount)],
    });
  };

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
  };
}
