# Onyx Protocol

<div align="center">

**A Privacy-Preserving, Zcash-Backed Stablecoin on Aztec**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Aztec](https://img.shields.io/badge/Aztec-v2.1.8-purple)](https://aztec.network)
[![Noir](https://img.shields.io/badge/Noir-Latest-black)](https://noir-lang.org)

[Website](https://onyx.xyz) • [Whitepaper](./whitepaper.pdf) • [Deck](./OnyxProtocol_Deck.pdf) • [Docs](./docs) • [Twitter](https://twitter.com/OnyxProtocol)

> **Note:** If you would like to look at a visual deck to understand more about the protocol architecture and flow, please view the [Onyx Protocol Deck](./OnyxProtocol_Deck.pdf).

</div>

## Overview

Onyx Protocol introduces **USDO**, a privacy-preserving USD-pegged stablecoin backed by Zcash (ZEC) and secured on the Aztec network. Unlike traditional stablecoins that sacrifice privacy for transparency, Onyx combines:

- **🔒 Privacy**: All balances and positions are shielded using Aztec's zero-knowledge rollup
- **💎 Real Collateral**: Every USDO is backed by ZEC held in verified reserves
- **📊 Dynamic Risk Model**: Three-zone minting function that adapts to market conditions
- **⏰ Time-Based Rewards**: Redemption bonuses that reward long-term holders
- **🛡️ Volatility Buffer**: Absorption pool to smooth out ZEC price swings

## Key Features

### Multi-Zone Pricing
Onyx uses a three-zone minting system that adjusts USDO issuance based on ZEC price:

- **Zone 1 (High Confidence)**: P ≥ Threshold → Generous minting with surplus capture
- **Zone 2 (Caution)**: Floor ≤ P < Threshold → Conservative minting gets tighter
- **Zone 3 (Emergency)**: P < Floor → Strict capital preservation mode

### xUSDO Bond Token
Surplus value above the conservative floor is tokenized as **xUSDO**, allowing risk-takers to capture upside while protecting USDO stability.

### Volatility Absorption Pool (VAP)
Accumulates excess collateral during strong markets to provide a buffer during downturns and support peg maintenance.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Zcash     │  ─────> │ Aztec Bridge │  ─────> │   Aztec     │
│  (Privacy)  │<─ ZEC ─>│   (Custody)  │<─ Mint ─>│  (Privvacy) │
└─────────────┘         └──────────────┘         └─────────────┘
                                                         │
                                                         ▼
                                        ┌──────────────────────────┐
                                        │   Onyx Smart Contracts   │
                                        │  ┌────────────────────┐  │
                                        │  │  UsdoVault (Core)  │  │
                                        │  ├────────────────────┤  │
                                        │  │   USDO Token       │  │
                                        │  │   xUSDO Token      │  │
                                        │  │   PriceOracle      │  │
                                        │  └────────────────────┘  │
                                        └──────────────────────────┘
```

### Smart Contracts

- **UsdoVault**: Core protocol logic, minting/redemption, zone calculations
- **USDOToken**: Private stablecoin token (Aztec native)
- **XUsdoToken**: Private bond token for surplus exposure
- **PriceOracle**: ZEC/USD price feed
- **ZToken**: Wrapped ZEC on Aztec (testnet)

## Getting Started

### Prerequisites

```bash
# Install Aztec CLI
bash -i <(curl -s https://install.aztec.network)

# Install Node.js dependencies
npm install
```

### Compile Contracts

```bash
# Compile all Noir contracts
aztec-nargo compile

# Generate verification keys
aztec-postprocess-contract target/*.json

# Patch artifacts for deployment
node --loader ts-node/esm scripts/patch_artifacts.mts
```

### Deploy to Sandbox

```bash
# Start Aztec sandbox (in one terminal)
aztec start --sandbox

# Deploy contracts (in new terminal)
cd scripts
node --loader ts-node/esm deploy_mixed.mts
```

Contracts will deploy to your local sandbox at `http://localhost:8080`.

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the landing page.  
Visit `http://localhost:3000/app` for the vault interface (demo).

## Deployed Addresses (Sandbox)

| Contract | Address |
|----------|---------|
| PriceOracle | `0x14b12fc63d4a2c1285fd1741c9c072c11de8c9633a618bca86e3ba49d9ed3aaf` |
| ZToken | `0x1cf9c77df8f0c2f0d41be8f44bb6f4aa38b79fc5b35ba14eeabb20da1b91c1e9` |
| USDOToken | `0x0e7f29f49fb27ea8c525c01898856fde82bfa0e2e48305596190b9175259f06e` |
| XUsdoToken | `0x111dd0cfb9ba78ca9c0dfc82ed55d8c54e61e5cf6a98fc3c22e23cea2ba88d82` |
| UsdoVault | `0x1a521853e853a33f907c6c504d7c6a0f0bb0e048ec80c71d22d2dfb4536a0fd0` |

```
onyx/
├── contracts/           # Noir smart contracts
│   ├── PriceOracle/
│   ├── usdo_token/
│   ├── xusdo_token/
│   ├── usdo_vault/      # Core vault logic
│   └── ZToken/
├── frontend/            # Next.js web app
├── scripts/             # Deployment & testing scripts
├── src/artifacts/       # Compiled contract artifacts
└── whitepaper.tex       # Technical whitepaper
```

## Mathematical Model

### Minting in Zone 1 (High Confidence)

When ZEC price `P_m >= P_t` (threshold):

```
USDO_minted = x * P_f * (1 + β)
xUSDO_minted = x * (P_m - P_f) * (1 - γ)
```

Where:
- `x` = ZEC deposited
- `P_f` = Floor price ($100)
- `β` = Bonus factor (0.01)
- `γ` = Protocol fee (0.1)

### Time-Based Redemption

```
RV(U, t) = U * [1 + φ * (P_m/P_f - 1) * e^(-λ⋅Δt)]
ZEC_out = RV(U, t) / max(P_m, ψ⋅P_f)
```

Where:
- `φ` = Participation factor (0.7)
- `λ` = Decay constant (0.02/day)
- `ψ` = Floor protection (1.1)

See [whitepaper.tex](./whitepaper.tex) for complete mathematical specification.

## Deployed Addresses (Sandbox)

| Contract | Address |
|----------|---------|
| PriceOracle | `0x14b12fc63d4a2c1285fd1741c9c072c11de8c9633a618bca86e3ba49d9ed3aaf` |
| ZToken | `0x1cf9c77df8f0c2f0d41be8f44bb6f4aa38b79fc5b35ba14eeabb20da1b91c1e9` |
| USDOToken | `0x0e7f29f49fb27ea8c525c01898856fde82bfa0e2e48305596190b9175259f06e` |
| XUsdoToken | `0x111dd0cfb9ba78ca9c0dfc82ed55d8c54e61e5cf6a98fc3c22e23cea2ba88d82` |
| UsdoVault | `0x1a521853e853a33f907c6c504d7c6a0f0bb0e048ec80c71d22d2dfb4536a0fd0` |

## Roadmap

- [x] **Phase 1**: Core protocol implementation
  - [x] Three-zone minting logic
  - [x] Time-based redemption
  - [x] VAP tracking
  - [x] Emergency modes
- [ ] **Phase 2**: Testnet launch
  - [ ] Real Zcash bridge
  - [ ] AMO controller for peg maintenance
  - [ ] Extended testing
- [ ] **Phase 3**: Mainnet preparation
  - [ ] Security audits
  - [ ] Governance token (ONYX)
  - [ ] zk-Solvency proofs
- [ ] **Phase 4**: Ecosystem growth
  - [ ] DEX integrations
  - [ ] Cross-chain support
  - [ ] Community governance

## Contributing

Onyx is open source and welcomes contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development

```bash
# Format contracts
aztec-nargo fmt

# Run linter
npm run lint

# Build frontend
cd frontend && npm run build
```

## Security

**⚠️ This is experimental software. Use at your own risk.**

Onyx Protocol is currently in active development. Contracts have NOT been audited. Do not use with real funds.

To report security issues, please email: security@onyx.xyz

## License

MIT License - see [LICENSE](./LICENSE) for details

## Team

Built with ❤️ by Onyx Labs

- **SerPepe** ([@SerPepeXBT](https://twitter.com/SerPepeXBT)) - Protocol Design & Development

## Acknowledgments

- [Aztec Network](https://aztec.network) - Privacy-preserving rollup infrastructure
- [Zcash](https://z.cash) - Pioneering privacy at the base layer
- [Noir](https://noir-lang.org) - Zero-knowledge DSL

---

<div align="center">

**[Read the Whitepaper](./whitepaper.pdf)** • **[Try the App](https://app.onyx.xyz)**

</div>
