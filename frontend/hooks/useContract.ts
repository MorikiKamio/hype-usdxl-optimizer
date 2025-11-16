'use client';

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import {
  OPTIMIZER_ADDRESS,
  OPTIMIZER_ABI,
  ERC20_ABI,
  WHYPE_ADDRESS,
  StrategyType,
  USDXL_ADDRESS,
} from '@/lib/contracts';
import { hyperEvmMainnet } from '@/app/providers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function useHYPEBalance(address: Address | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: WHYPE_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && WHYPE_ADDRESS !== ZERO_ADDRESS },
  });

  return {
    balance: data ? Number(formatEther(data)) : 0,
    isLoading,
    refetch,
  };
}

export function useUSDXLBalance(address: Address | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: USDXL_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && USDXL_ADDRESS !== ZERO_ADDRESS },
  });

  return {
    balance: data ? Number(formatEther(data)) : 0,
    isLoading,
    refetch,
  };
}

export function useUserPosition(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: OPTIMIZER_ADDRESS,
    abi: OPTIMIZER_ABI,
    functionName: 'getPosition',
    args: address ? [address] : undefined,
    query: { enabled: !!address && OPTIMIZER_ADDRESS !== ZERO_ADDRESS },
  });

  if (!data) {
    return { position: null, isLoading, error, refetch };
  }

  const [equity, , collateral, debt, ltvBps] = data as [bigint, bigint, bigint, bigint, bigint];

  return {
    position: {
      deposited: Number(formatEther(equity)),
      strategy: StrategyType.Leverage,
      activeStrategy: 'Leverage',
      currentAPR: 0,
      healthFactor: 0,
      collateral: Number(formatEther(collateral)),
      debt: Number(formatEther(debt)),
      ltv: Number(ltvBps) / 100,
    },
    isLoading,
    error,
    refetch,
  };
}

export function useApprove() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    await writeContract({
      address: WHYPE_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      chain: hyperEvmMainnet,
      account: address,
      args: [OPTIMIZER_ADDRESS, parseEther(amount)],
    });
  };

  return { approve, isPending, isConfirming, isSuccess, error };
}

export function useDeposit() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount');

    await writeContract({
      address: OPTIMIZER_ADDRESS,
      abi: OPTIMIZER_ABI,
      functionName: 'deposit',
      chain: hyperEvmMainnet,
      account: address,
      args: [parseEther(amount)],
    });
  };

  const depositAuto = (amount: string) => deposit(amount);
  const depositToStrategy = (amount: string, _strategy: number) => deposit(amount);

  return {
    deposit,
    depositAuto,
    depositToStrategy,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useWithdraw() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount');

    await writeContract({
      address: OPTIMIZER_ADDRESS,
      abi: OPTIMIZER_ABI,
      functionName: 'withdraw',
      chain: hyperEvmMainnet,
      account: address,
      args: [parseEther(amount)],
    });
  };

  return { withdraw, isPending, isConfirming, isSuccess, error, hash };
}
