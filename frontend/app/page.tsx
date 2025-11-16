'use client';

import { useAccount } from 'wagmi';
import { useRef, useState } from 'react';
import { TrendingUp, Shield } from 'lucide-react';
import Header from '@/components/Header';
import PositionCard from '@/components/PositionCard';
import StrategyCard from '@/components/StrategyCard';
import DepositForm from '@/components/DepositForm';
import { STRATEGIES } from '@/lib/types';
import { useUserPosition, useHYPEBalance } from '@/hooks/useContract';
import { useNativeHYPEBalance } from '@/hooks/useNativeHYPE';

const COLORS = {
  bg: '#0a1f1f',
  cardBg: '#0f2929',
  border: '#1a3a3a',
  primary: '#00d4aa',
  primaryHover: '#00bfa0',
  textPrimary: '#ffffff',
  textSecondary: '#8b9d9d',
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const { position, refetch: refetchPosition } = useUserPosition(address);
  const { balance: whypeBalance, refetch: refetchWHYPE } = useHYPEBalance(address);
  const { balance: nativeBalance, refetch: refetchNative } = useNativeHYPEBalance(address);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('auto');
  const depositFormRef = useRef<HTMLDivElement>(null);

  // Construct user position for display
  const userPosition = position
    ? {
        balance: nativeBalance,
        deposited: position.deposited,
        currentAPR: position.currentAPR,
        healthFactor: position.healthFactor,
        activeStrategy: position.activeStrategy,
      }
    : {
        balance: nativeBalance,
        deposited: 0,
        currentAPR: 0,
        healthFactor: 0,
        activeStrategy: '',
      };

  const playSelectSound = () => {
    const audio = new Audio('/sounds/select.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategyId(strategyId);
    playSelectSound();

    if (depositFormRef.current) {
      depositFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      depositFormRef.current.style.transition = 'all 0.3s ease';
      depositFormRef.current.style.transform = 'scale(1.02)';
      depositFormRef.current.style.boxShadow = `0 0 40px ${COLORS.primary}, 0 0 80px ${COLORS.primary}44`;

      setTimeout(() => {
        if (depositFormRef.current) {
          depositFormRef.current.style.transform = 'scale(1)';
          depositFormRef.current.style.boxShadow = 'none';
        }
      }, 600);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {!isConnected ? (
            <div
              style={{
                backgroundColor: COLORS.cardBg,
                borderRadius: '8px',
                padding: '48px',
                textAlign: 'center',
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ marginBottom: '32px' }}>
                <h2
                  style={{
                    fontSize: '36px',
                    fontWeight: 500,
                    marginBottom: '16px',
                    color: COLORS.textPrimary,
                  }}
                >
                  Welcome to HYPE USDXL Optimizer
                </h2>
                <p style={{ color: COLORS.textSecondary, fontSize: '18px' }}>
                  Connect your wallet to start optimizing your yields
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px',
                  marginTop: '48px',
                }}
              >
                <div
                  style={{
                    backgroundColor: COLORS.bg,
                    padding: '24px',
                    borderRadius: '8px',
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <TrendingUp style={{ margin: '0 auto 12px' }} color={COLORS.primary} size={32} />
                  <h3
                    style={{
                      fontWeight: 500,
                      fontSize: '18px',
                      marginBottom: '8px',
                      color: COLORS.textPrimary,
                    }}
                  >
                    Up to 18% APR
                  </h3>
                  <p style={{ color: COLORS.textSecondary, fontSize: '14px' }}>
                    Choose from 4 optimized yield strategies
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: COLORS.bg,
                    padding: '24px',
                    borderRadius: '8px',
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Shield style={{ margin: '0 auto 12px' }} color={COLORS.primary} size={32} />
                  <h3
                    style={{
                      fontWeight: 500,
                      fontSize: '18px',
                      marginBottom: '8px',
                      color: COLORS.textPrimary,
                    }}
                  >
                    Auto Risk Management
                  </h3>
                  <p style={{ color: COLORS.textSecondary, fontSize: '14px' }}>
                    Smart health factor monitoring & rebalancing
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <PositionCard position={userPosition} isConnected={isConnected} />

              <div
                style={{
                  backgroundColor: COLORS.cardBg,
                  borderRadius: '8px',
                  padding: '24px',
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '24px',
                      fontWeight: 500,
                      color: COLORS.textPrimary,
                      margin: 0,
                    }}
                  >
                    Strategy Marketplace
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        padding: '8px 16px',
                        backgroundColor: `${COLORS.primary}33`,
                        color: COLORS.primary,
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      Live APR
                    </span>
                    <span
                      style={{
                        padding: '8px 16px',
                        backgroundColor: `${COLORS.primary}22`,
                        color: COLORS.textSecondary,
                        borderRadius: '6px',
                        fontSize: '13px',
                      }}
                    >
                      👆 Click to deposit
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {STRATEGIES.map((strategy) => (
                    <StrategyCard
                      key={strategy.id}
                      strategy={strategy}
                      isActive={strategy.name === userPosition.activeStrategy}
                      isSelected={selectedStrategyId === strategy.id}
                      onSelect={() => handleStrategySelect(strategy.id)}
                    />
                  ))}
                </div>
              </div>

              <div ref={depositFormRef}>
                <DepositForm
                  balance={nativeBalance}
                  whypeBalance={whypeBalance}
                  selectedStrategy={selectedStrategyId}
                  onStrategyChange={setSelectedStrategyId}
                  onSuccess={() => {
                    refetchPosition();
                    refetchNative();
                    refetchWHYPE();
                  }}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          marginTop: '64px',
          padding: '32px 0',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            textAlign: 'center',
            color: COLORS.textSecondary,
            fontSize: '14px',
          }}
        >
          <p>Contract: 0x... • HyperEVM Testnet (Chain ID: 998)</p>
          <p style={{ marginTop: '8px' }}>Built for HLH Seoul 2025 • Powered by HypurrFi</p>
        </div>
      </footer>
    </div>
  );
}
