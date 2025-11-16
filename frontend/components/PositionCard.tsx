'use client';

import { TrendingUp } from 'lucide-react';
import { UserPosition } from '@/lib/types';

const COLORS = {
  cardBg: '#0f2929',
  border: '#1a3a3a',
  primary: '#00d4aa',
  textPrimary: '#ffffff',
  textSecondary: '#8b9d9d',
  riskHigh: '#ff4444',
  riskMedium: '#ffaa00',
};

interface PositionCardProps {
  position: UserPosition | null;
  isConnected: boolean;
}

export default function PositionCard({ position, isConnected }: PositionCardProps) {
  if (!isConnected) return null;

  const healthColor = position && position.healthFactor >= 1.5 ? COLORS.primary :
                     position && position.healthFactor >= 1.2 ? COLORS.riskMedium : 
                     COLORS.riskHigh;

  return (
    <div style={{
      backgroundColor: COLORS.cardBg,
      borderRadius: '8px',
      padding: '24px',
      border: `1px solid ${COLORS.border}`
    }}>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 500, 
        marginBottom: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        color: COLORS.textPrimary 
      }}>
        <TrendingUp color={COLORS.primary} size={20} />
        Your Position
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '24px' 
      }}>
        <div>
          <p style={{ color: COLORS.textSecondary, fontSize: '14px', marginBottom: '8px' }}>
            Balance
          </p>
          <p style={{ fontSize: '24px', fontWeight: 400, color: COLORS.textPrimary }}>
            {position?.balance.toLocaleString() || '0'} HYPE
          </p>
        </div>
        <div>
          <p style={{ color: COLORS.textSecondary, fontSize: '14px', marginBottom: '8px' }}>
            Deposited
          </p>
          <p style={{ fontSize: '24px', fontWeight: 400, color: COLORS.textPrimary }}>
            {position?.deposited.toLocaleString() || '0'} HYPE
          </p>
        </div>
        <div>
          <p style={{ color: COLORS.textSecondary, fontSize: '14px', marginBottom: '8px' }}>
            Current APR
          </p>
          <p style={{ fontSize: '24px', fontWeight: 400, color: COLORS.primary }}>
            {position?.currentAPR ? position.currentAPR.toFixed(2) : '0.00'}%
          </p>
        </div>
        <div>
          <p style={{ color: COLORS.textSecondary, fontSize: '14px', marginBottom: '8px' }}>
            Health Factor
          </p>
          <p style={{ fontSize: '24px', fontWeight: 400, color: healthColor }}>
            {position?.healthFactor.toFixed(2) || '0'}
            {position && position.healthFactor >= 1.5 && ' ✓'}
          </p>
        </div>
      </div>
      {position && position.activeStrategy && (
        <div style={{ 
          marginTop: '16px', 
          paddingTop: '16px', 
          borderTop: `1px solid ${COLORS.border}` 
        }}>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary }}>
            Active Strategy: <span style={{ color: COLORS.primary, fontWeight: 500 }}>
              {position.activeStrategy}
            </span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '12px' }}>
            <div>
              <p style={{ color: COLORS.textSecondary, fontSize: '13px', marginBottom: '4px' }}>
                Collateral Exposure
              </p>
              <p style={{ fontSize: '18px', color: COLORS.textPrimary }}>
                {position.collateral.toLocaleString()} WHYPE
              </p>
            </div>
            <div>
              <p style={{ color: COLORS.textSecondary, fontSize: '13px', marginBottom: '4px' }}>
                Debt Exposure
              </p>
              <p style={{ fontSize: '18px', color: COLORS.textPrimary }}>
                {position.debt.toLocaleString()} WHYPE
              </p>
            </div>
            <div>
              <p style={{ color: COLORS.textSecondary, fontSize: '13px', marginBottom: '4px' }}>
                LTV
              </p>
              <p style={{ fontSize: '18px', color: COLORS.textPrimary }}>
                {position.ltv.toFixed(2)}%
              </p>
            </div>
          </div>
          {position.hip3Deposited && position.hip3Deposited > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: COLORS.textSecondary, fontSize: '13px', marginBottom: '4px' }}>
                HIP-3 Delegated
              </p>
              <p style={{ fontSize: '18px', color: COLORS.textPrimary }}>
                {position.hip3Deposited.toLocaleString()} HYPE
              </p>
            </div>
          )}
          {position.usdxlDeposited && position.usdxlDeposited > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: COLORS.textSecondary, fontSize: '13px', marginBottom: '4px' }}>
                USDXL Deposited
              </p>
              <p style={{ fontSize: '18px', color: COLORS.textPrimary }}>
                {position.usdxlDeposited.toLocaleString()} USDXL
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
