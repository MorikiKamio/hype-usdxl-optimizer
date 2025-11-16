'use client';

import { useReadContract } from 'wagmi';
import {
  HYPURRFI_POOL_ADDRESS,
  HYPURRFI_POOL_ABI,
  WHYPE_ADDRESS,
} from '@/lib/contracts';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const RAY = 1e27;
const ZERO_BIGINT = BigInt(0);

function rateToPercent(rate: bigint) {
  if (rate === ZERO_BIGINT) return 0;
  return Number(rate) / (RAY / 100);
}

export function useHypurrFiRates() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: HYPURRFI_POOL_ADDRESS,
    abi: HYPURRFI_POOL_ABI,
    functionName: 'getReserveData',
    args: [WHYPE_ADDRESS],
    query: {
      enabled:
        HYPURRFI_POOL_ADDRESS !== ZERO_ADDRESS && WHYPE_ADDRESS !== ZERO_ADDRESS,
    },
  });

  if (!data) {
    return {
      supplyAPR: null,
      borrowAPR: null,
      availableLiquidity: null,
      totalDebt: null,
      isLoading,
      error,
      refetch,
    };
  }

  const [availableLiquidity, totalDebt, liquidityRate, variableBorrowRate] = data as [
    bigint,
    bigint,
    bigint,
    bigint
  ];

  return {
    supplyAPR: rateToPercent(liquidityRate),
    borrowAPR: rateToPercent(variableBorrowRate),
    availableLiquidity: Number(availableLiquidity),
    totalDebt: Number(totalDebt),
    isLoading,
    error,
    refetch,
  };
}
