'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { ReactNode } from 'react';

// HyperEVM Mainnet definition
export const hyperEvmMainnet = defineChain({
  id: 999,
  name: 'HyperEVM',
  network: 'hyperliquid-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.hypurrscan.io'] },
    public: { http: ['https://rpc.hypurrscan.io'] },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVM Explorer',
      url: 'https://hyperevmscan.io',
    },
  },
  testnet: false,
});

const config = getDefaultConfig({
  appName: 'HYPE USDXL Optimizer',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [hyperEvmMainnet],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
