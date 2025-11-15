'use client';

import { Wallet } from 'lucide-react';

const COLORS = {
  bg: '#0a1f1f',
  border: '#1a3a3a',
  primary: '#00d4aa',
  primaryHover: '#00bfa0',
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
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: COLORS.primary,
            color: COLORS.bg,
            padding: '10px 24px',
            borderRadius: '6px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
            <Wallet size={18} />
            Connect
          </button>
        </div>
      </div>
    </header>
  );
}
