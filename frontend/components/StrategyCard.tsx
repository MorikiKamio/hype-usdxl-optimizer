'use client';

import { Strategy } from '@/lib/types';

const COLORS = {
  bg: '#0a1f1f',
  cardBg: '#0f2929',
  border: '#1a3a3a',
  primary: '#00d4aa',
  textPrimary: '#ffffff',
  textSecondary: '#8b9d9d',
  riskHigh: '#ff4444',
  riskMedium: '#ffaa00',
  riskLow: '#00d4aa',
  riskLowBlue: '#4488ff',
};

interface StrategyCardProps {
  strategy: Strategy;
  isActive?: boolean;
  onSelect?: () => void;
}

export default function StrategyCard({ strategy, isActive, onSelect }: StrategyCardProps) {
  const riskColors = {
    High: COLORS.riskHigh,
    Medium: COLORS.riskMedium,
    Low: strategy.color === 'blue' ? COLORS.riskLowBlue : COLORS.riskLow,
  };

  const riskColor = riskColors[strategy.risk];

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid ${isActive ? COLORS.primary : COLORS.border}`,
        backgroundColor: isActive ? COLORS.cardBg : COLORS.bg,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <span style={{ fontSize: '30px' }}>{strategy.emoji}</span>
          <div>
            <h3
              style={{
                fontWeight: 500,
                fontSize: '18px',
                color: COLORS.textPrimary,
                margin: 0,
              }}
            >
              {strategy.name}
            </h3>
            <p
              style={{
                color: COLORS.textSecondary,
                fontSize: '14px',
                margin: '4px 0 0 0',
              }}
            >
              {strategy.description}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              fontSize: '36px',
              fontWeight: 400,
              color: COLORS.primary,
              margin: 0,
              lineHeight: 1,
            }}
          >
            {strategy.apr}%
          </p>
          <p
            style={{
              fontSize: '12px',
              color: COLORS.textSecondary,
              margin: '4px 0 0 0',
            }}
          >
            APR
          </p>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: `1px solid ${COLORS.border}`,
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: `${riskColor}33`,
              color: riskColor,
            }}
          >
            {strategy.risk} Risk
          </span>
          <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>
            TVL: ${(strategy.tvl / 1_000_000).toFixed(1)}M
          </span>
        </div>
        {strategy.minDeposit > 0 && (
          <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            Min: {(strategy.minDeposit / 1000).toFixed(0)}K HYPE
          </span>
        )}
      </div>
    </div>
  );
}
