'use client';

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { formatEther, parseEther, Address } from 'viem';
import { OPTIMIZER_ABI, OPTIMIZER_ADDRESS, USDXL_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import { hyperEvmMainnet } from '@/app/providers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function useUsdxlPosition(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: OPTIMIZER_ADDRESS,
    abi: OPTIMIZER_ABI,
    functionName: 'getUsdxlPosition',
    args: address ? [address] : undefined,
    query: { enabled: !!address && OPTIMIZER_ADDRESS !== ZERO_ADDRESS },
  });

  if (!data) {
    return {
      deposited: 0,
      totalDeposited: 0,
      isLoading,
      error,
      refetch,
    };
  }

  const [deposited, totalDeposited] = data as [bigint, bigint];

  return {
    deposited: Number(formatEther(deposited)),
    totalDeposited: Number(formatEther(totalDeposited)),
    isLoading,
    error,
    refetch,
  };
}

function useUsdxlAction(functionName: 'depositUsdxl' | 'withdrawUsdxl') {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const action = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount');

    await writeContract({
      address: OPTIMIZER_ADDRESS,
      abi: OPTIMIZER_ABI,
      functionName,
      chain: hyperEvmMainnet,
      account: address,
      args: [parseEther(amount)],
    });
  };

  return { action, isPending, isConfirming, isSuccess, error };
}

export function useUsdxlDepositAction() {
  return useUsdxlAction('depositUsdxl');
}

export function useUsdxlWithdrawAction() {
  return useUsdxlAction('withdrawUsdxl');
}

export function useUsdxlApprove() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    await writeContract({
      address: USDXL_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      chain: hyperEvmMainnet,
      account: address,
      args: [OPTIMIZER_ADDRESS, parseEther(amount)],
    });
  };

  return { approve, isPending, isConfirming, isSuccess, error };
}
