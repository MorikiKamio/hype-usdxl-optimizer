'use client';

import { useState } from 'react';
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
  onSuccess?: () => void;
}

export default function DepositForm({ balance, onSuccess }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('auto');

  const { approve, isPending: isApproving, isSuccess: isApproved } = useApprove();
  const {
    depositAuto,
    depositToStrategy,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useDeposit();

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
      if (selectedStrategy === 'auto') {
        await depositAuto(amount);
      } else {
        const strategyIndex = STRATEGIES.findIndex((s) => s.id === selectedStrategy);
        if (strategyIndex === -1) {
          throw new Error('Invalid strategy');
        }
        await depositToStrategy(amount, strategyIndex as StrategyType);
      }

      // Success
      if (isSuccess && onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Deposit failed:', err);
      alert(err?.message || 'Deposit failed. Please try again.');
    }
  };

  const isLoading = isPending || isConfirming || isApproving;

  return (
    <div
      style={{
        backgroundColor: COLORS.cardBg,
        borderRadius: '8px',
        padding: '24px',
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 500,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: COLORS.textPrimary,
        }}
      >
        <Zap color={COLORS.primary} size={20} />
        Deposit & Optimize
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Amount Input */}
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

        {/* Strategy Selection */}
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
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
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
              <option value="auto">Auto-Select (Highest APR)</option>
              {STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.apr}% APR
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

        {/* Buttons */}
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
            }}
          >
            {isPending && 'Waiting for approval...'}
            {isConfirming && 'Confirming...'}
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
