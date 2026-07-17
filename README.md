# 🗳️ Live Poll: Made Simple

> An on-chain, single-question poll built on **Soroban** (Stellar smart contracts), with a multi-wallet React frontend that shows results updating **live** as votes come in — no refresh required.

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-live--poll--stellar.vercel.app-10b981?style=for-the-badge)](https://github.com/anishakumari97/Live-Poll-Stellar-White-Belt-Level-2)
[![Stellar Testnet](https://img.shields.io/badge/Network-Stellar_Testnet-00D2FF?style=for-the-badge)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart_Contract-Soroban-FF6B6B?style=for-the-badge)](https://soroban.stellar.org)

</div>

---

## 📸 Screenshots

| Dashboard | Connect Wallet |
|:---------:|:--------------:|
| ![Dashboard](./docs/live-results.png) | ![Connect Wallet](./docs/wallet-options.png) |

---

## ✨ Features

- 🔗 **Wallet Connect** — Supports Freighter, xBull, Lobstr, Albedo, and more via `@creit.tech/stellar-wallets-kit`
- 💰 **Live XLM Balance** — Displays connected wallet balance immediately
- 📊 **Real-time Results** — Live updating bar graph showing vote distribution as votes come in
- 🗳️ **On-chain Voting** — Casting a vote triggers a real Soroban smart contract transaction
- ✅ **Stellar Explorer Link** — Direct link to verify transaction and contract events on `stellar.expert`
- 📝 **Double-Vote Protection** — Tracks voters on-chain to reject duplicate votes transparently
- 🔴 **Live Event Feed** — Real-time event streaming via Soroban RPC `getEvents` polling

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Rust · Soroban SDK · WebAssembly |
| **Frontend** | React · TypeScript · Vite |
| **Wallet Integration** | `@creit.tech/stellar-wallets-kit` |
| **Styling** | Vanilla CSS |
| **Deployment** | Vercel (frontend) · Stellar Testnet (contract) |

---

## 📋 Smart Contract Details

**Contract ID (Testnet):**
```
CC4GI6ZAZQZRC5OKA6MVLLVAXNZXRBK6UUCONVXWCSXGWHMVJDFREYM2
```

**Verify on Stellar Expert:**
🔗 [View Contract on Explorer](https://stellar.expert/explorer/testnet/contract/CC4GI6ZAZQZRC5OKA6MVLLVAXNZXRBK6UUCONVXWCSXGWHMVJDFREYM2)

---

### 🧾 Transaction Hashes (Verifiable Testnet Operations)

These are the on-chain transactions for compiling, deploying, and initializing the smart contract:

| Operation | Transaction Hash | Explorer Link |
|---|---|---|
| WASM Upload | `c0c108cb7a73eb422d41f6ee9a4c1d250671a1c345378a42d7c4ab99a0f6636e` | [View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/tx/c0c108cb7a73eb422d41f6ee9a4c1d250671a1c345378a42d7c4ab99a0f6636e) |
| Contract Instantiation | `320cc7f1c21b46fca1738e6627086288475ad126e35a97ce005b33c0c1c277fd` | [View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/tx/320cc7f1c21b46fca1738e6627086288475ad126e35a97ce005b33c0c1c277fd) |
| Contract Initialization | `b4ae1fd3cf36f395166671ae41fc881dd86925872bd6b41e15cb315629bbcb6b` | [View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/tx/b4ae1fd3cf36f395166671ae41fc881dd86925872bd6b41e15cb315629bbcb6b) |

---

### 👛 Wallet Options Available

The app supports multiple wallets via the connect modal:

![Wallet Options](./docs/wallet-options.png)

### Contract Functions

| Function | Description |
|----------|-------------|
| `initialize(admin, question, options)` | Sets the question, list of options, and admin address (One-time call) |
| `vote(voter, option_index)` | Casts a vote for the option; updates status & emits a `vote` event |
| `get_question()` | Returns the active poll question |
| `get_options()` | Returns the list of all available options |
| `get_results()` | Returns current vote counts mapped by option index |
| `has_voted(voter)` | Checks whether the address has already voted |

### Contract Architecture
```rust
// On-chain storage keys
enum DataKey {
    Admin,       // Admin address
    Question,    // Poll question
    Options,     // List of options (Vec<String>)
    Votes,       // Map of option index to vote count
    Voters,      // Map of voter address to boolean
    Initialized, // Initialization status
}
```

---

## 🚀 Run Locally

### Prerequisites
- Node.js v18+
- Rust + `wasm32-unknown-unknown` target
- Freighter or other supported wallet extension (set to **Testnet**)

### Frontend
```bash
# Clone the repo
git clone https://github.com/anishakumari97/Live-Poll-Stellar-White-Belt-Level-2.git
cd Live-Poll-Stellar-White-Belt-Level-2/frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_CONTRACT_ID=CC4GI6ZAZQZRC5OKA6MVLLVAXNZXRBK6UUCONVXWCSXGWHMVJDFREYM2" > .env

# Start dev server
npm run dev
```

### Smart Contract (optional — already deployed)
```bash
cd contract

# Build WASM
stellar contract build

# Deploy to Testnet
stellar contract deploy --wasm target/wasm32v1-none/release/live_poll_contract.wasm --source deployer --network testnet
```

---

## 🔄 User Flow

```
1. Open app → Connect wallet (Freighter / xBull / Albedo etc.)
      ↓
2. See your XLM balance + active poll options
      ↓
3. Click "Vote" on your chosen option
      ↓
4. Wallet extension pops up → Approve transaction
      ↓
5. Transaction submitted & confirmed on Stellar Testnet
      ↓
6. Graph updates live + Tx success banner with Stellar Explorer link shows up ✅
```

---

## 📁 Project Structure

```
stellar-live-poll/
├── contract/
│   ├── src/
│   │   ├── lib.rs            # Soroban smart contract logic
│   │   └── test.rs           # Automated unit tests
│   └── Cargo.toml
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── PollCard.tsx       # Poll question and voting buttons
    │   │   ├── WalletConnect.tsx  # Wallet connect modal and status
    │   │   └── TxStatus.tsx       # Transaction state banner
    │   ├── lib/
    │   │   ├── config.ts          # Network configurations
    │   │   ├── contract.ts        # Soroban RPC invocations
    │   │   ├── events.ts          # Event listening & fetching
    │   │   └── wallet.ts          # StellarWalletsKit helper
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    └── vite.config.ts
```

---

## 🌐 Live Deployment

| | Link |
|--|------|
| **Frontend** | https://github.com/anishakumari97/Live-Poll-Stellar-White-Belt-Level-2 |
| **Contract** | [stellar.expert/explorer/testnet/contract/CC4G...](https://stellar.expert/explorer/testnet/contract/CC4GI6ZAZQZRC5OKA6MVLLVAXNZXRBK6UUCONVXWCSXGWHMVJDFREYM2) |
| **Network** | Stellar Testnet |
| **RPC** | https://soroban-testnet.stellar.org |

---

## 👤 Author

**anishakumari97** — [@anishakumari97](https://github.com/anishakumari97)

---

<div align="center">
  Built with ❤️ on <strong>Stellar Soroban</strong>
</div>
