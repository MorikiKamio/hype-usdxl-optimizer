'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

const COLORS = {
  bg: '#0a1f1f',
  border: '#1a3a3a',
  textPrimary: '#ffffff',
  textSecondary: '#8b9d9d',
};

export default function Header() {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: `1px solid ${COLORS.border}`,
      backgroundColor: COLORS.bg
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 500, color: COLORS.textPrimary, margin: 0 }}>
              HYPE USDXL Optimizer
            </h1>
            <p style={{ color: COLORS.textSecondary, fontSize: '14px', marginTop: '4px' }}>
              Multi-Strategy Yield Marketplace
            </p>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
