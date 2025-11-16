export interface Strategy {
  id: string;
  name: string;
  emoji: string;
  apr: number;
  risk: 'High' | 'Medium' | 'Low';
  description: string;
  color: string;
  minDeposit: number;
}

export interface UserPosition {
  balance: number;
  deposited: number;
  currentAPR: number;
  healthFactor: number;
  activeStrategy: string;
  collateral: number;
  debt: number;
  ltv: number;
  hip3Deposited?: number;
  usdxlDeposited?: number;
}

export const STRATEGIES: Strategy[] = [
  {
    id: 'HYPE_LEVERAGE',
    name: 'HYPE 3x Leverage',
    emoji: '🥇',
    apr: 18.0,
    risk: 'High',
    description: 'Amplify HYPE exposure through recursive borrowing',
    color: 'red',
    minDeposit: 0,
  },
  {
    id: 'HYBRID_MULTI_ASSET',
    name: 'Hybrid Multi-Asset',
    emoji: '🥈',
    apr: 12.5,
    risk: 'Medium',
    description: 'Diversified HYPE + USDXL collateral portfolio',
    color: 'yellow',
    minDeposit: 0,
  },
  {
    id: 'CORE_WRITER_HIP3',
    name: 'CoreWriter HIP-3',
    emoji: '🥉',
    apr: 6.0,
    risk: 'Low',
    description: 'Direct validator delegation with fee rebates',
    color: 'blue',
    minDeposit: 500_000,
  },
  {
    id: 'USDXL_STABILITY',
    name: 'USDXL Stability',
    emoji: '🏅',
    apr: 4.0,
    risk: 'Low',
    description: 'USDXL carry trade farming',
    color: 'green',
    minDeposit: 0,
  },
];
