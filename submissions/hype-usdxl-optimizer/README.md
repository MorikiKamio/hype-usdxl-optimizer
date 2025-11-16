# HYPE USDXL Optimizer

Leveraged WHYPE + USDXL optimizer deployed on HyperEVM (Chain 999) for the HypurrFi bounty.

## Highlights
- Auto-looping supply/borrow on the production HypurrFi pool with configurable target LTV, loops, and health factor
- HIP-3 CoreWriter delegation path + direct USDXL stability deposits, all from one vault contract
- Next.js 15 frontend with live on-chain APR/TVL metrics, wrap/approve/deposit flows, and per-strategy UI
- 100% real contracts: WHYPE `0x5555…5555`, HypurrFi pool `0xceCc…A14b`, USDXL `0xca79…C645`, optimizer `0x6189…3790`

## Demo
- Live app: https://hype-usdxl-optimizer.vercel.app
- (Add demo screenshots / video links in `demo/`)

## Tech Stack
- Solidity 0.8.21 (Foundry)
- Next.js 15 + TypeScript + Wagmi/RainbowKit/Viem
- HypurrFi + CoreWriter HIP-3 contracts on HyperEVM

## How to Run
```
# Contracts
cd contract
forge install
forge build
forge test

# Frontend
cd ../frontend
npm install
npm run dev
```

## License
MIT (see `LICENSE`).
