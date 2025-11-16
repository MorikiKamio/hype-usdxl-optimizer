'use client';

import { useState, useEffect } from 'react';
import { Zap, ChevronDown } from 'lucide-react';
import { STRATEGIES } from '@/lib/types';
import { useDeposit, useApprove } from '@/hooks/useContract';
import { StrategyType } from '@/lib/contracts';

const COLORS = {
  bg: '#0a1f1f',
  cardBg: '#0f2929',
  border: '#1a3a3a',
  primary: '#00d4aa',
  primaryHover: '#00bfa0',
  textPrimary: '#ffffff',
  textSecondary: '#8b9d9d',
};

interface DepositFormProps {
  balance: number;
  selectedStrategy?: string;
  onStrategyChange?: (strategyId: string) => void;
  onSuccess?: () => void;
}

export default function DepositForm({
  balance,
  selectedStrategy = 'auto',
  onStrategyChange,
  onSuccess,
}: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [localStrategy, setLocalStrategy] = useState(selectedStrategy);

  useEffect(() => {
    setLocalStrategy(selectedStrategy);
  }, [selectedStrategy]);

  const { approve, isPending: isApproving, isSuccess: isApproved } = useApprove();
  const { depositAuto, depositToStrategy, isPending, isConfirming, isSuccess, error } = useDeposit();

  const handleStrategyChange = (newStrategy: string) => {
    setLocalStrategy(newStrategy);
    if (onStrategyChange) {
      onStrategyChange(newStrategy);
    }
  };

  const handleApprove = async () => {
    try {
      await approve(amount);
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Approval failed. Please try again.');
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      if (localStrategy === 'auto') {
        await depositAuto(amount);
      } else {
        const strategyIndex = STRATEGIES.findIndex((s) => s.id === localStrategy);
        if (strategyIndex === -1) {
          throw new Error('Invalid strategy');
        }
        await depositToStrategy(amount, strategyIndex as StrategyType);
      }

      if (isSuccess && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Deposit failed:', err);
      const message = err instanceof Error ? err.message : 'Deposit failed. Please try again.';
      alert(message);
    }
  };

  const isLoading = isPending || isConfirming || isApproving;

  const selectedStrategyDetails =
    localStrategy === 'auto' ? null : STRATEGIES.find((s) => s.id === localStrategy);

  return (
    <div
      style={{
        backgroundColor: COLORS.cardBg,
        borderRadius: '8px',
        padding: '24px',
        border: `1px solid ${COLORS.border}`,
        transition: 'all 0.3s ease',
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 500,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: COLORS.textPrimary,
        }}
      >
        <Zap color={COLORS.primary} size={20} />
        Deposit & Optimize
      </h2>

      {selectedStrategyDetails && (
        <div
          style={{
            padding: '12px',
            backgroundColor: `${COLORS.primary}11`,
            border: `1px solid ${COLORS.primary}`,
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          <p style={{ fontSize: '13px', color: COLORS.textSecondary, margin: '0 0 4px 0' }}>
            Selected Strategy:
          </p>
          <p style={{ fontSize: '16px', color: COLORS.primary, fontWeight: 500, margin: 0 }}>
            {selectedStrategyDetails.emoji} {selectedStrategyDetails.name} (
            {selectedStrategyDetails.apr}% APR)
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              color: COLORS.textSecondary,
              marginBottom: '8px',
            }}
          >
            Amount
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                padding: '10px 16px',
                color: COLORS.textPrimary,
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: COLORS.textSecondary,
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              HYPE
            </span>
          </div>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>
            Available: {balance.toLocaleString()} HYPE
          </p>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              color: COLORS.textSecondary,
              marginBottom: '8px',
            }}
          >
            Strategy
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={localStrategy}
              onChange={(e) => handleStrategyChange(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                padding: '10px 16px',
                color: COLORS.textPrimary,
                fontSize: '16px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              <option value="auto">🎯 Auto-Select (Highest APR)</option>
              {STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name} - {s.apr}% APR
                </option>
              ))}
            </select>
            <ChevronDown
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
              color={COLORS.textSecondary}
              size={18}
            />
          </div>
        </div>

        {!isApproved ? (
          <button
            onClick={handleApprove}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            style={{
              width: '100%',
              backgroundColor: COLORS.primary,
              color: COLORS.bg,
              padding: '12px 24px',
              borderRadius: '6px',
              fontWeight: 500,
              border: 'none',
              cursor: isLoading || !amount ? 'not-allowed' : 'pointer',
              opacity: isLoading || !amount ? 0.5 : 1,
              fontSize: '16px',
            }}
          >
            {isApproving ? 'Approving...' : 'Approve HYPE'}
          </button>
        ) : (
          <button
            onClick={handleDeposit}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            style={{
              width: '100%',
              backgroundColor: COLORS.primary,
              color: COLORS.bg,
              padding: '12px 24px',
              borderRadius: '6px',
              fontWeight: 500,
              border: 'none',
              cursor: isLoading || !amount ? 'not-allowed' : 'pointer',
              opacity: isLoading || !amount ? 0.5 : 1,
              fontSize: '16px',
            }}
          >
            {isPending && 'Waiting for approval...'}
            {isConfirming && 'Confirming transaction...'}
            {!isPending && !isConfirming && 'Deposit'}
          </button>
        )}

        {isSuccess && (
          <div
            style={{
              padding: '12px',
              backgroundColor: `${COLORS.primary}33`,
              borderRadius: '6px',
              color: COLORS.primary,
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            ✓ Deposit successful!
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#ff444433',
              borderRadius: '6px',
              color: '#ff4444',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            Error: {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
