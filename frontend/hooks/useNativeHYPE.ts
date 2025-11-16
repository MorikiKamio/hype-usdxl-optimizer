'use client';

import { useBalance } from 'wagmi';
import { Address } from 'viem';
import { hyperEvmMainnet } from '@/app/providers';

export function useNativeHYPEBalance(address: Address | undefined) {
  const { data, isLoading, refetch } = useBalance({
    address,
    chainId: hyperEvmMainnet.id,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data ? Number(data.formatted) : 0,
    symbol: data?.symbol || 'HYPE',
    decimals: data?.decimals || 18,
    isLoading,
    refetch,
  };
}
