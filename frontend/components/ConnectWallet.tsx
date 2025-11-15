'use client';

const COLORS = {
  cardBg: '#0f2929',
  border: '#1a3a3a',
  primary: '#00d4aa',
  primaryHover: '#00bfa0',
  textPrimary: '#ffffff',
  textSecondary: '#8b9d9d',
};

interface ConnectWalletProps {
  isConnected: boolean;
  address?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function ConnectWallet({
  isConnected,
  address,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) {
  return (
    <div
      style={{
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: '14px' }}>Wallet Status</p>
        <p style={{ margin: '4px 0 0', color: COLORS.textPrimary, fontWeight: 500 }}>
          {isConnected
            ? `Connected: ${address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet'}`
            : 'Not connected'}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {isConnected ? (
          <button
            type="button"
            onClick={onDisconnect}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: 'transparent',
              color: COLORS.textPrimary,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: COLORS.primary,
              color: COLORS.cardBg,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
