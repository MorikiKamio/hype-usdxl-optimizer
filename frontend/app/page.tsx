'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import PositionCard from '@/components/PositionCard';
import StrategyCard from '@/components/StrategyCard';
import { STRATEGIES, UserPosition } from '@/lib/types';

const COLORS = {
  bg: '#0a1f1f',
  cardBg: '#0f2929',
  border: '#1a3a3a',
  primary: '#00d4aa',
  textPrimary: '#ffffff',
  textSecondary: '#8b9d9d',
};

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [userPosition] = useState<UserPosition>({
    balance: 1000,
    deposited: 500,
    currentAPR: 18.0,
    healthFactor: 1.45,
    activeStrategy: 'HYPE 3x Leverage',
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {!isConnected ? (
            <div
              style={{
                backgroundColor: COLORS.cardBg,
                padding: '48px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>
                Welcome to HYPE USDXL Optimizer
              </h2>
              <button
                onClick={() => setIsConnected(true)}
                style={{
                  backgroundColor: COLORS.primary,
                  padding: '12px 32px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <>
              <PositionCard position={userPosition} isConnected={isConnected} />

              <div
                style={{
                  backgroundColor: COLORS.cardBg,
                  padding: '24px',
                  borderRadius: '8px',
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Strategy Marketplace</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {STRATEGIES.map((strategy) => (
                    <StrategyCard key={strategy.id} strategy={strategy} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          marginTop: '64px',
          padding: '32px 24px',
          textAlign: 'center',
          color: COLORS.textSecondary,
          fontSize: '14px',
        }}
      >
        <p>Contract: 0x... • HyperEVM Testnet (Chain ID: 998)</p>
        <p style={{ marginTop: '8px' }}>Built for HLH Seoul 2025 • Powered by HypurrFi</p>
      </footer>
    </div>
  );
}
