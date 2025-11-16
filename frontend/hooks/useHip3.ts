'use client';

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { Address, formatEther, parseEther } from 'viem';
import { OPTIMIZER_ADDRESS, OPTIMIZER_ABI } from '@/lib/contracts';
import { hyperEvmMainnet } from '@/app/providers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function useHip3Position(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: OPTIMIZER_ADDRESS,
    abi: OPTIMIZER_ABI,
    functionName: 'getHip3Position',
    args: address ? [address] : undefined,
    query: { enabled: !!address && OPTIMIZER_ADDRESS !== ZERO_ADDRESS },
  });

  if (!data) {
    return {
      deposited: 0,
      totalDeposited: 0,
      minDeposit: 0,
      validator: undefined,
      isLoading,
      error,
      refetch,
    };
  }

  const [deposited, totalDeposited, minDeposit, validator] = data as [
    bigint,
    bigint,
    bigint,
    Address,
  ];

  return {
    deposited: Number(formatEther(deposited)),
    totalDeposited: Number(formatEther(totalDeposited)),
    minDeposit: Number(formatEther(minDeposit)),
    validator,
    isLoading,
    error,
    refetch,
  };
}

function useHip3Action(functionName: 'depositHip3' | 'withdrawHip3') {
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

export function useHip3DepositAction() {
  return useHip3Action('depositHip3');
}

export function useHip3WithdrawAction() {
  return useHip3Action('withdrawHip3');
}
