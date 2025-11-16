'use client';

import { useState, useEffect } from 'react';
import { Zap, ChevronDown, ArrowRightLeft } from 'lucide-react';
import { STRATEGIES } from '@/lib/types';
import { useDeposit, useApprove, useWithdraw } from '@/hooks/useContract';
import { useWrapHYPE } from '@/hooks/useWrapHYPE';
import { StrategyType } from '@/lib/contracts';
import { useHip3DepositAction, useHip3WithdrawAction } from '@/hooks/useHip3';
import {
  useUsdxlDepositAction,
  useUsdxlWithdrawAction,
  useUsdxlApprove,
} from '@/hooks/useUsdxl';

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
  whypeBalance?: number;
  depositedBalance?: number;
  hip3Balance?: number;
  hip3MinDeposit?: number;
  hip3Validator?: string;
  usdxlWalletBalance?: number;
  usdxlDeposited?: number;
  selectedStrategy?: string;
  onStrategyChange?: (strategyId: string) => void;
  onSuccess?: () => void;
}

export default function DepositForm({
  balance,
  whypeBalance = 0,
  depositedBalance = 0,
  hip3Balance = 0,
  hip3MinDeposit = 0,
  hip3Validator,
  usdxlWalletBalance = 0,
  usdxlDeposited = 0,
  selectedStrategy = 'auto',
  onStrategyChange,
  onSuccess,
}: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [hip3WithdrawAmount, setHip3WithdrawAmount] = useState('');
  const [usdxlWithdrawAmount, setUsdxlWithdrawAmount] = useState('');
  const [localStrategy, setLocalStrategy] = useState(selectedStrategy);
  const [needsWrap, setNeedsWrap] = useState(false);

  const isHip3Selected = localStrategy === 'CORE_WRITER_HIP3';
  const isUsdxlSelected = localStrategy === 'USDXL_STABILITY';

  useEffect(() => {
    setLocalStrategy(selectedStrategy);
  }, [selectedStrategy]);

  useEffect(() => {
    const amountNum = parseFloat(amount) || 0;
    if (isHip3Selected || isUsdxlSelected) {
      setNeedsWrap(false);
    } else {
      setNeedsWrap(amountNum > whypeBalance && amountNum <= balance);
    }
  }, [amount, balance, whypeBalance, isHip3Selected, isUsdxlSelected]);

  const { wrap, isPending: isWrapping, isSuccess: wrapSuccess } = useWrapHYPE();
  const { approve, isPending: isApproving, isSuccess: isApproved } = useApprove();
  const { depositAuto, depositToStrategy, isPending, isConfirming, isSuccess, error } = useDeposit();
  const {
    withdraw,
    isPending: isWithdrawPending,
    isConfirming: isWithdrawConfirming,
    isSuccess: isWithdrawSuccess,
    error: withdrawError,
  } = useWithdraw();
  const hip3Deposit = useHip3DepositAction();
  const hip3Withdraw = useHip3WithdrawAction();
  const usdxlApprove = useUsdxlApprove();
  const usdxlDeposit = useUsdxlDepositAction();
  const usdxlWithdraw = useUsdxlWithdrawAction();

  const handleStrategyChange = (newStrategy: string) => {
    setLocalStrategy(newStrategy);
    onStrategyChange?.(newStrategy);
  };

  const handleWrap = async () => {
    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const wrapAmount = Math.min(Math.max(amountNum - whypeBalance, 0), balance);
      if (wrapAmount <= 0) {
        alert('Nothing to wrap');
        return;
      }
      await wrap(wrapAmount.toString());
    } catch (err) {
      console.error('Wrap failed:', err);
      alert('Wrapping failed. Please try again.');
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
      if (isHip3Selected) {
        if (hip3MinDeposit && parseFloat(amount) < hip3MinDeposit) {
          alert(`Minimum deposit is ${hip3MinDeposit} HYPE`);
          return;
        }
        if (!hip3Validator || hip3Validator === '0x0000000000000000000000000000000000000000') {
          alert('HIP-3 validator not configured yet');
          return;
        }
        await hip3Deposit.action(amount);
      } else if (isUsdxlSelected) {
        await usdxlDeposit.action(amount);
      } else if (localStrategy === 'auto') {
        await depositAuto(amount);
      } else {
        const strategyIndex = STRATEGIES.findIndex((s) => s.id === localStrategy);
        if (strategyIndex === -1) {
          throw new Error('Invalid strategy');
        }
        await depositToStrategy(amount, strategyIndex as StrategyType);
      }

      onSuccess?.();
    } catch (err) {
      console.error('Deposit failed:', err);
      const message =
        err instanceof Error ? err.message : 'Deposit failed. Please try again.';
      alert(message);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > depositedBalance) {
      alert('Amount exceeds deposited balance');
      return;
    }

    try {
      await withdraw(withdrawAmount);
      setWithdrawAmount('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Withdraw failed:', err);
      const message =
        err instanceof Error ? err.message : 'Withdraw failed. Please try again.';
      alert(message);
    }
  };

  const handleHip3Withdraw = async () => {
    if (!hip3WithdrawAmount || parseFloat(hip3WithdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (parseFloat(hip3WithdrawAmount) > hip3Balance) {
      alert('Amount exceeds HIP-3 balance');
      return;
    }

    try {
      await hip3Withdraw.action(hip3WithdrawAmount);
      setHip3WithdrawAmount('');
      onSuccess?.();
    } catch (err) {
      console.error('HIP-3 withdraw failed:', err);
      const message =
        err instanceof Error ? err.message : 'Withdraw failed. Please try again.';
      alert(message);
    }
  };

  const handleUsdxlWithdraw = async () => {
    if (!usdxlWithdrawAmount || parseFloat(usdxlWithdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (parseFloat(usdxlWithdrawAmount) > usdxlDeposited) {
      alert('Amount exceeds USDXL balance');
      return;
    }

    try {
      await usdxlWithdraw.action(usdxlWithdrawAmount);
      setUsdxlWithdrawAmount('');
      onSuccess?.();
    } catch (err) {
      console.error('USDXL withdraw failed:', err);
      const message =
        err instanceof Error ? err.message : 'Withdraw failed. Please try again.';
      alert(message);
    }
  };

  const isLeverageLoading = isPending || isConfirming || isApproving || isWrapping;
  const isHip3Loading = hip3Deposit.isPending || hip3Deposit.isConfirming;
  const isUsdxlLoading = usdxlDeposit.isPending || usdxlDeposit.isConfirming;
  const disableInputs = isHip3Selected ? isHip3Loading : isUsdxlSelected ? isUsdxlLoading : isLeverageLoading;
  const isLoading = isLeverageLoading;

  const selectedStrategyDetails =
    localStrategy === 'auto' ? null : STRATEGIES.find((s) => s.id === localStrategy);

  const needsWrapAction = needsWrap && !wrapSuccess;

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
                disabled={disableInputs}
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
              {isUsdxlSelected ? 'USDXL' : 'HYPE'}
            </span>
          </div>

          <div style={{ marginTop: '8px', fontSize: '13px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: COLORS.textSecondary,
              }}
            >
              <span>Native HYPE:</span>
              <span style={{ fontWeight: 500 }}>{balance.toFixed(4)} HYPE</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: COLORS.textSecondary,
                marginTop: '4px',
              }}
            >
              <span>Wrapped HYPE (WHYPE):</span>
              <span style={{ fontWeight: 500 }}>{whypeBalance.toFixed(4)} WHYPE</span>
            </div>
            {isUsdxlSelected && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: COLORS.textSecondary,
                  marginTop: '4px',
                }}
              >
                <span>USDXL Wallet:</span>
                <span style={{ fontWeight: 500 }}>{usdxlWalletBalance.toFixed(4)} USDXL</span>
              </div>
            )}
          </div>

          {needsWrapAction && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#ff880022',
                border: '1px solid #ff8800',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#ff8800',
              }}
            >
              ⚠️ You need to wrap {(parseFloat(amount) - whypeBalance).toFixed(4)} HYPE first
            </div>
          )}
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

        {isHip3Selected && (
          <div
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: `${COLORS.primary}11`,
              border: `1px dashed ${COLORS.primary}`,
              borderRadius: '6px',
              color: COLORS.textSecondary,
              fontSize: '13px',
            }}
          >
            <div>HIP-3 Validator: {hip3Validator || 'Not set'}</div>
            <div>Minimum deposit: {hip3MinDeposit.toFixed(2)} HYPE</div>
          </div>
        )}

        {!isHip3Selected && !isUsdxlSelected && needsWrapAction && (
          <button
            onClick={handleWrap}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            style={{
              width: '100%',
              backgroundColor: '#ff8800',
              color: COLORS.bg,
              padding: '12px 24px',
              borderRadius: '6px',
              fontWeight: 500,
              border: 'none',
              cursor: isLoading || !amount ? 'not-allowed' : 'pointer',
              opacity: isLoading || !amount ? 0.5 : 1,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <ArrowRightLeft size={18} />
            {isWrapping ? 'Wrapping...' : `Wrap ${(parseFloat(amount) - whypeBalance).toFixed(4)} HYPE`}
          </button>
        )}

        {isUsdxlSelected && (
          <button
            onClick={() => usdxlApprove.approve(amount)}
            disabled={isUsdxlLoading || !amount || parseFloat(amount) <= 0}
            style={{
              width: '100%',
              backgroundColor: COLORS.primary,
              color: COLORS.bg,
              padding: '12px 24px',
              borderRadius: '6px',
              fontWeight: 500,
              border: 'none',
              cursor: isUsdxlLoading || !amount ? 'not-allowed' : 'pointer',
              opacity: isUsdxlLoading || !amount ? 0.5 : 1,
              fontSize: '16px',
            }}
          >
            {usdxlApprove.isPending ? 'Approving...' : 'Approve USDXL'}
          </button>
        )}

        {!isHip3Selected && !isUsdxlSelected && !needsWrapAction && !isApproved && (
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
            {isApproving ? 'Approving...' : 'Approve WHYPE'}
          </button>
        )}

        {!isHip3Selected && !isUsdxlSelected && !needsWrapAction && isApproved && (
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

        {isHip3Selected && (
          <button
            onClick={handleDeposit}
            disabled={isHip3Loading || !amount || parseFloat(amount) <= 0}
            style={{
              width: '100%',
              backgroundColor: COLORS.primary,
              color: COLORS.bg,
              padding: '12px 24px',
              borderRadius: '6px',
              fontWeight: 500,
              border: 'none',
              cursor: isHip3Loading || !amount ? 'not-allowed' : 'pointer',
              opacity: isHip3Loading || !amount ? 0.5 : 1,
              fontSize: '16px',
            }}
          >
            {hip3Deposit.isPending && 'Waiting for approval...'}
            {hip3Deposit.isConfirming && 'Confirming transaction...'}
            {!hip3Deposit.isPending && !hip3Deposit.isConfirming && 'Deposit to HIP-3'}
          </button>
        )}

        {isUsdxlSelected && (
          <button
            onClick={handleDeposit}
            disabled={isUsdxlLoading || !amount || parseFloat(amount) <= 0}
            style={{
              width: '100%',
              backgroundColor: COLORS.primary,
              color: COLORS.bg,
              padding: '12px 24px',
              borderRadius: '6px',
              fontWeight: 500,
              border: 'none',
              cursor: isUsdxlLoading || !amount ? 'not-allowed' : 'pointer',
              opacity: isUsdxlLoading || !amount ? 0.5 : 1,
              fontSize: '16px',
            }}
          >
            {usdxlDeposit.isPending && 'Waiting for approval...'}
            {usdxlDeposit.isConfirming && 'Confirming transaction...'}
            {!usdxlDeposit.isPending && !usdxlDeposit.isConfirming && 'Deposit USDXL'}
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

        {wrapSuccess && !isSuccess && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#ff880033',
              borderRadius: '6px',
              color: '#ff8800',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            ✓ Wrapped successfully! Approve WHYPE to continue.
          </div>
        )}

        {hip3Deposit.isSuccess && (
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
            ✓ HIP-3 deposit successful!
          </div>
        )}

        {usdxlDeposit.isSuccess && (
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
            ✓ USDXL deposit successful!
          </div>
        )}

        {hip3Deposit.error && (
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
            HIP-3 Error: {hip3Deposit.error.message}
          </div>
        )}

        {usdxlDeposit.error && (
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
            USDXL Error: {usdxlDeposit.error.message}
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

      <div
        style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: COLORS.textPrimary, fontSize: '18px' }}>Withdraw</h3>
          <span style={{ color: COLORS.textSecondary, fontSize: '13px' }}>
            Deposited: {depositedBalance.toFixed(4)} WHYPE
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="0.00"
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
            WHYPE
          </span>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={
            isWithdrawPending ||
            isWithdrawConfirming ||
            !withdrawAmount ||
            parseFloat(withdrawAmount) <= 0
          }
          style={{
            width: '100%',
            backgroundColor: '#ff4444',
            color: COLORS.bg,
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: 500,
            border: 'none',
            cursor:
              isWithdrawPending || isWithdrawConfirming ? 'not-allowed' : 'pointer',
            opacity:
              isWithdrawPending || isWithdrawConfirming || !withdrawAmount ? 0.5 : 1,
            fontSize: '16px',
          }}
        >
          {isWithdrawPending && 'Waiting for approval...'}
          {isWithdrawConfirming && 'Confirming transaction...'}
          {!isWithdrawPending && !isWithdrawConfirming && 'Withdraw'}
        </button>
        {isWithdrawSuccess && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#ff444433',
              borderRadius: '6px',
              color: '#ffcccc',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            ✓ Withdraw successful!
          </div>
        )}
        {withdrawError && (
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
            Error: {withdrawError.message}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: COLORS.textPrimary, fontSize: '18px' }}>HIP-3 Withdraw</h3>
          <span style={{ color: COLORS.textSecondary, fontSize: '13px' }}>
            Delegated: {hip3Balance.toFixed(4)} HYPE
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={hip3WithdrawAmount}
            onChange={(e) => setHip3WithdrawAmount(e.target.value)}
            placeholder="0.00"
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
        <button
          onClick={handleHip3Withdraw}
          disabled={
            hip3Withdraw.isPending ||
            hip3Withdraw.isConfirming ||
            !hip3WithdrawAmount ||
            parseFloat(hip3WithdrawAmount) <= 0
          }
          style={{
            width: '100%',
            backgroundColor: '#ff4444',
            color: COLORS.bg,
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: 500,
            border: 'none',
            cursor:
              hip3Withdraw.isPending || hip3Withdraw.isConfirming ? 'not-allowed' : 'pointer',
            opacity:
              hip3Withdraw.isPending || hip3Withdraw.isConfirming || !hip3WithdrawAmount
                ? 0.5
                : 1,
            fontSize: '16px',
          }}
        >
          {hip3Withdraw.isPending && 'Waiting for approval...'}
          {hip3Withdraw.isConfirming && 'Confirming transaction...'}
          {!hip3Withdraw.isPending && !hip3Withdraw.isConfirming && 'Withdraw HIP-3'}
        </button>
        {hip3Withdraw.isSuccess && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#ff444433',
              borderRadius: '6px',
              color: '#ffcccc',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            ✓ HIP-3 withdraw successful!
          </div>
        )}
        {hip3Withdraw.error && (
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
            HIP-3 Error: {hip3Withdraw.error.message}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: COLORS.textPrimary, fontSize: '18px' }}>USDXL Withdraw</h3>
          <span style={{ color: COLORS.textSecondary, fontSize: '13px' }}>
            Deposited: {usdxlDeposited.toFixed(4)} USDXL
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={usdxlWithdrawAmount}
            onChange={(e) => setUsdxlWithdrawAmount(e.target.value)}
            placeholder="0.00"
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
            USDXL
          </span>
        </div>
        <button
          onClick={handleUsdxlWithdraw}
          disabled={
            usdxlWithdraw.isPending ||
            usdxlWithdraw.isConfirming ||
            !usdxlWithdrawAmount ||
            parseFloat(usdxlWithdrawAmount) <= 0
          }
          style={{
            width: '100%',
            backgroundColor: '#ff4444',
            color: COLORS.bg,
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: 500,
            border: 'none',
            cursor:
              usdxlWithdraw.isPending || usdxlWithdraw.isConfirming ? 'not-allowed' : 'pointer',
            opacity:
              usdxlWithdraw.isPending ||
              usdxlWithdraw.isConfirming ||
              !usdxlWithdrawAmount
                ? 0.5
                : 1,
            fontSize: '16px',
          }}
        >
          {usdxlWithdraw.isPending && 'Waiting for approval...'}
          {usdxlWithdraw.isConfirming && 'Confirming transaction...'}
          {!usdxlWithdraw.isPending && !usdxlWithdraw.isConfirming && 'Withdraw USDXL'}
        </button>
        {usdxlWithdraw.isSuccess && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#ff444433',
              borderRadius: '6px',
              color: '#ffcccc',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            ✓ USDXL withdraw successful!
          </div>
        )}
        {usdxlWithdraw.error && (
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
            USDXL Error: {usdxlWithdraw.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
