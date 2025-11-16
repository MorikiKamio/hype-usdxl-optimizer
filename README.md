# HYPE USDXL Optimizer

> Leveraged WHYPE + HypurrFi vault running live on HyperEVM mainnet (chain 999)

![License](https://img.shields.io/badge/License-MIT-yellow.svg) ![Solidity](https://img.shields.io/badge/Solidity-0.8.21-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Status](https://img.shields.io/badge/Status-Mainnet-green)

- **Live dApp**: https://hype-usdxl-optimizer.vercel.app
- **Optimizer contract**: [`0x61894f55E565664D2Ba97B94d9015B39E0103790`](https://hyperevmscan.io/address/0x61894f55E565664D2Ba97B94d9015B39E0103790)
- **Network**: HyperEVM Mainnet (chain ID 999)
- **Deployer**: `0x940BAe532F1ebA60fb3c1a269fEB862ee2EEaa12`

## ✨ What It Does

- Wrap native HYPE → WHYPE, deposit, and automatically loop supply/borrow on HypurrFi to reach a target LTV.
- Tracks each user’s equity, collateral, debt, and LTV so withdrawals unwind proportional leverage safely.
- Displays live HypurrFi APYs on the frontend by reading on-chain reserve data.
- 100% production contracts (WHYPE, HypurrFi pool, USDXL) on HyperEVM—no mocks.

## 🧱 Contracts & Addresses

| Name | Address | Notes |
|------|---------|-------|
| HYPEUSDXLOptimizerLite | `0x61894f55E565664D2Ba97B94d9015B39E0103790` | Auto-leverage vault (this repo) |
| WHYPE (Wrapped HYPE) | `0x5555555555555555555555555555555555555555` | Canonical wrapped token |
| HypurrFi Pool | `0xceCcE0EB9DD2Ef7996e01e25DD70e461F918A14b` | Production lending pool |
| USDXL Stablecoin | `0xca79db4B49f608eF54a5CB813FbEd3a6387bC645` | Production stable |

Deployment metadata lives in `deployments/mainnet.json`.

## 🏗 Architecture

```
User Wallet
   │
   ├─ Wrap HYPE → WHYPE (canonical contract)
   ├─ Approve optimizer to spend WHYPE
   └─ Deposit amount
        │
        ▼
HYPEUSDXLOptimizerLite
   • Supplies WHYPE to HypurrFi
   • Borrows WHYPE, resupplies to reach target LTV
   • Tracks total collateral/debt/shares
   • On withdraw, unwinds proportional share and repays debt
        │
        ▼
HypurrFi Pool (production)
```

Key contract parameters:
- `targetLtvBps` (default 70%)
- `maxLoops` (default 5)
- `minHealthFactor` (default 1.3)
These can be tuned by the owner to balance yield vs. safety.

## 🖥 Frontend Overview

- Built with Next.js 15, TypeScript, Wagmi v2, RainbowKit, Viem.
- Fetches live supply/borrow APRs via `getReserveData(WHYPE)` and maps them to strategy tiles.
- Position card shows collateral, debt, LTV, and live APR from HypurrFi.
- Withdraw tab unwinds leverage automatically and returns WHYPE; separate button lets users unwrap to native HYPE if desired.

### Environment

```
NEXT_PUBLIC_CHAIN_ID=999
NEXT_PUBLIC_RPC_URL=https://rpc.hypurrscan.io
NEXT_PUBLIC_WHYPE_ADDRESS=0x5555555555555555555555555555555555555555
NEXT_PUBLIC_USDXL_ADDRESS=0xca79db4B49f608eF54a5CB813FbEd3a6387bC645
NEXT_PUBLIC_HYPURRFI_POOL=0xceCcE0EB9DD2Ef7996e01e25DD70e461F918A14b
NEXT_PUBLIC_OPTIMIZER_ADDRESS=0x61894f55E565664D2Ba97B94d9015B39E0103790
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...
```

## 🚀 Quick Start

```bash
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

Deploy script: `contract/script/DeployLite.s.sol` (Forge). Broadcast artifacts stored under `contract/broadcast/`.

## 🧪 Testing & Safety

- Solidity 0.8.21, OZ SafeERC20/Ownable/ReentrancyGuard.
- Vault enforces:
  - Max loops per deposit
  - Target LTV check each iteration
  - `minHealthFactor` guard after supply/borrow/withdraw
- Shares-based accounting ensures proportional unwinds.
- Recommend running `forge test --gas-report` after modifying leverage logic.

## 📈 Roadmap Ideas

1. Configurable strategies per user (different target LTVs).
2. HIP-3/CoreWriter delegation for native validator rewards.
3. Advanced health monitoring + keeper-based auto-rebalance.
4. Full analytics dashboard (historic APY, revenue share, etc.).

## 📜 License

MIT — see `LICENSE`.

## 🙌 Credits

Built for the HLH Seoul 2025 / HypurrFi bounty track by @morikikamio. Huge thanks to the HypurrFi and HyperEVM teams for providing the production infrastructure.
