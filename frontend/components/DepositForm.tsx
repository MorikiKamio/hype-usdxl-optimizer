'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Strategy } from '@/lib/types';

const COLORS = {
  cardBg: '#0f2929',
  border: '#1a3a3a',
  primary: '#00d4aa',
  primaryHover: '#00bfa0',
  textPrimary: '#ffffff',
  textSecondary: '#8b9d9d',
  inputBg: '#0a1f1f',
};

interface DepositFormProps {
  isConnected: boolean;
  selectedStrategy?: Strategy | null;
  onDeposit?: (amount: number) => void;
  onWithdraw?: (amount: number) => void;
}

export default function DepositForm({
  isConnected,
  selectedStrategy,
  onDeposit,
  onWithdraw,
}: DepositFormProps) {
  const [amount, setAmount] = useState('');

  const isValidAmount = useMemo(() => {
    const value = Number(amount);
    return isFinite(value) && value > 0;
  }, [amount]);

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!isValidAmount) return;

    const value = Number(amount);
    onDeposit?.(value);
    setAmount('');
  };

  const handleWithdraw = () => {
    if (!isValidAmount) return;
    onWithdraw?.(Number(amount));
    setAmount('');
  };

  if (!isConnected) {
    return (
      <div
        style={{
          backgroundColor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px',
          padding: '24px',
          color: COLORS.textSecondary,
          textAlign: 'center',
        }}
      >
        Connect your wallet to deposit into strategies.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: COLORS.textSecondary }}>
            Selected Strategy
          </p>
          <p style={{ margin: '4px 0 0', color: COLORS.textPrimary, fontWeight: 500 }}>
            {selectedStrategy ? selectedStrategy.name : 'None'}
          </p>
        </div>
        {selectedStrategy && (
          <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: '13px' }}>
            Min Deposit:{' '}
            <span style={{ color: COLORS.textPrimary }}>
              {selectedStrategy.minDeposit.toLocaleString()} HYPE
            </span>
          </p>
        )}
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>Amount (HYPE)</span>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          style={{
            padding: '14px 16px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.inputBg,
            color: COLORS.textPrimary,
            fontSize: '18px',
            outline: 'none',
          }}
        />
      </label>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={!isValidAmount}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '12px 18px',
            borderRadius: '6px',
            border: 'none',
            cursor: isValidAmount ? 'pointer' : 'not-allowed',
            backgroundColor: COLORS.primary,
            color: COLORS.cardBg,
            fontWeight: 600,
            fontSize: '15px',
            transition: 'opacity 0.2s',
            opacity: isValidAmount ? 1 : 0.5,
          }}
        >
          Deposit
        </button>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={!isValidAmount}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '12px 18px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.border}`,
            backgroundColor: 'transparent',
            color: COLORS.textPrimary,
            fontWeight: 600,
            fontSize: '15px',
            cursor: isValidAmount ? 'pointer' : 'not-allowed',
            opacity: isValidAmount ? 1 : 0.5,
          }}
        >
          Withdraw
        </button>
      </div>
    </form>
  );
}
