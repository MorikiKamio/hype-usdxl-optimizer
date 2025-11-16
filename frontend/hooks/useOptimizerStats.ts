'use client';

import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { OPTIMIZER_ADDRESS } from '@/lib/contracts';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function useOptimizerStats() {
  const { data: collateralData } = useReadContract({
    address: OPTIMIZER_ADDRESS,
    abi: [
      {
        name: 'totalCollateral',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
      },
    ],
    functionName: 'totalCollateral',
    query: { enabled: OPTIMIZER_ADDRESS !== ZERO_ADDRESS },
  });

  const { data: debtData } = useReadContract({
    address: OPTIMIZER_ADDRESS,
    abi: [
      {
        name: 'totalDebt',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
      },
    ],
    functionName: 'totalDebt',
    query: { enabled: OPTIMIZER_ADDRESS !== ZERO_ADDRESS },
  });

  const { data: targetLtvData } = useReadContract({
    address: OPTIMIZER_ADDRESS,
    abi: [
      {
        name: 'targetLtvBps',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
      },
    ],
    functionName: 'targetLtvBps',
    query: { enabled: OPTIMIZER_ADDRESS !== ZERO_ADDRESS },
  });

  const collateral = collateralData ? Number(formatEther(collateralData as bigint)) : 0;
  const debt = debtData ? Number(formatEther(debtData as bigint)) : 0;
  const targetLtv = targetLtvData ? Number(targetLtvData) / 100 : null;
  const tvlUsd = collateral; // assume 1 WHYPE ~ 1 HYPE (placeholder)
  const leverage = collateral > 0 ? collateral / (collateral - debt) : 1;

  return {
    collateral,
    debt,
    targetLtv,
    tvl: tvlUsd,
    leverage,
  };
}
