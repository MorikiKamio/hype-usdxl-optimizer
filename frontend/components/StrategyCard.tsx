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
  isSelected?: boolean;
  liveApr?: number | null;
  liveTvl?: number | null;
  targetLtv?: number | null;
  statusNote?: string;
  onSelect?: () => void;
}

export default function StrategyCard({
  strategy,
  isActive = false,
  isSelected = false,
  liveApr,
  liveTvl,
  targetLtv,
  statusNote,
  onSelect,
}: StrategyCardProps) {
  const riskColors = {
    High: COLORS.riskHigh,
    Medium: COLORS.riskMedium,
    Low: strategy.color === 'blue' ? COLORS.riskLowBlue : COLORS.riskLow,
  };

  const riskColor = riskColors[strategy.risk];

  const getBorderColor = () => {
    if (isActive) return riskColor;
    if (isSelected) return COLORS.primary;
    return COLORS.border;
  };

  const getBackgroundColor = () => {
    if (isActive) return COLORS.cardBg;
    if (isSelected) return `${COLORS.primary}11`;
    return COLORS.bg;
  };

  const displayApr = typeof liveApr === 'number' ? liveApr : strategy.apr;
  const aprLabel = typeof liveApr === 'number' ? 'Live APR' : 'APR';

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '20px',
        borderRadius: '8px',
        border: `2px solid ${getBorderColor()}`,
        backgroundColor: getBackgroundColor(),
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isActive && !isSelected) {
          e.currentTarget.style.backgroundColor = COLORS.cardBg;
          e.currentTarget.style.borderColor = COLORS.primary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !isSelected) {
          e.currentTarget.style.backgroundColor = COLORS.bg;
          e.currentTarget.style.borderColor = COLORS.border;
        }
      }}
    >
      {isSelected && !isActive && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '4px 12px',
            backgroundColor: COLORS.primary,
            color: COLORS.bg,
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          SELECTED
        </div>
      )}

      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '4px 12px',
            backgroundColor: '#00ff88',
            color: COLORS.bg,
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          ACTIVE
        </div>
      )}

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
            {displayApr.toFixed(2)}%
          </p>
          <p
            style={{
              fontSize: '12px',
              color: COLORS.textSecondary,
              margin: '4px 0 0 0',
            }}
          >
            {aprLabel}
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
            TVL:{' '}
            {typeof liveTvl === 'number'
              ? `${liveTvl.toFixed(2)} WHYPE`
              : 'N/A'}
          </span>
        </div>
        {targetLtv && (
          <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            Target LTV: {targetLtv.toFixed(1)}%
          </span>
        )}
        {strategy.minDeposit > 0 && (
          <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            Min: {(strategy.minDeposit / 1000).toFixed(0)}K HYPE
          </span>
        )}
      </div>
      {statusNote && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px',
            borderRadius: '6px',
            border: `1px dashed ${COLORS.border}`,
            color: COLORS.textSecondary,
            fontSize: '13px',
          }}
        >
          {statusNote}
        </div>
      )}
    </div>
  );
}
