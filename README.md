# 🗳️ Live Poll — Stellar White Belt Level 2

An on-chain, single-question poll built on **Soroban** (Stellar smart
contracts), with a multi-wallet React frontend that shows results updating
**live** as votes come in — no refresh required.

> Built for White Belt Level 2: multi-wallet integration, contract
> deployment, and real-time event handling.

## ✨ Features → Requirements mapping

| Requirement | Where it lives |
|---|---|
| Multi-wallet integration | `frontend/src/lib/wallet.ts` — [StellarWalletsKit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) with `allowAllModules()` (Freighter, xBull, Albedo, Lobstr, Hana, Rabet, WalletConnect, Ledger) |
| 3+ error types handled | `wallet.ts` → `WalletNotFoundError`, `UserRejectedError`, `InsufficientBalanceError`, `NetworkError`, `ContractCallError` (5 total) |
| Contract deployed on testnet | `contract/src/lib.rs` — see [Deployed contract](#deployed-contract) below |
| Contract called from frontend | `frontend/src/lib/contract.ts` — `castVote()` builds, simulates, signs, and submits a real `vote` invocation |
| Reading + writing contract data | `get_question` / `get_options` / `get_results` / `has_voted` (reads) and `vote` (write) |
| Transaction status visible | `frontend/src/components/TxStatus.tsx` — building → pending → success/error, with a Stellar Expert link |
| Event listening / real-time sync | `frontend/src/lib/events.ts` — polls Soroban RPC `getEvents` for the contract's `vote` topic every 4s, plus an 8s results-poll safety net |
| 2+ meaningful commits | See commit history — contract, frontend, and docs were committed separately |

## 🏗️ Architecture

```
contract/            Soroban smart contract (Rust)
  src/lib.rs          Poll logic: initialize, vote, get_results, get_options...
  src/test.rs          Unit tests (double-vote, invalid option, full flow)

frontend/            Vite + React + TypeScript
  src/lib/wallet.ts    StellarWalletsKit wrapper + typed errors
  src/lib/contract.ts  Build/sign/submit transactions, poll tx status
  src/lib/events.ts    Real-time vote event subscription
  src/components/      WalletConnect, PollCard, TxStatusBanner
```

### How a vote flows through the system

1. User connects a wallet via the **StellarWalletsKit** modal (any supported
   wallet — this is the multi-wallet piece).
2. Frontend builds a `vote(voter, option_index)` invocation, simulates it via
   Soroban RPC, and asks the connected wallet to sign it.
3. Signed transaction is submitted; the UI shows **pending**, then polls
   `getTransaction` until it's **success** or **failed**.
4. On success, the contract emits a `vote` event. Every connected client is
   polling `getEvents` for that topic, so results update **live** for
   everyone watching — not just the voter.

## 🧯 Error handling

| Error | Trigger | User sees |
|---|---|---|
| `WalletNotFoundError` | Selected wallet extension isn't installed | "X is not installed or could not be reached." |
| `UserRejectedError` | User declines the signing prompt | "You rejected the request in your wallet." |
| `InsufficientBalanceError` | Account lacks XLM for fee/reserve | "This account doesn't have enough XLM..." |
| `NetworkError` | RPC/Horizon unreachable or times out | "Could not reach the Stellar network..." |
| `ContractCallError` | Contract-level error (e.g. already voted, invalid option) | Raw contract error surfaced in the banner |

All errors render in a dismiss-on-retry banner at the top of the app instead
of failing silently.

## 🚀 Setup

### Prerequisites
- Node.js 18+
- Rust + `wasm32-unknown-unknown` target + `stellar-cli` (only needed if you
  want to redeploy the contract yourself — see [DEPLOY.md](./DEPLOY.md))
- A testnet-funded wallet (e.g. [Freighter](https://www.freighter.app/), get
  funds from https://friendbot.stellar.org)

### Run the frontend

```bash
cd frontend
cp .env.example .env      # paste in the CONTRACT_ID below
npm install
npm run dev
```

### Deploy your own contract (optional — a live one is already deployed)

Full step-by-step in [DEPLOY.md](./DEPLOY.md).

## 📌 Deployed contract

- **Network:** Stellar Testnet
- **Contract ID:** `PASTE_YOUR_DEPLOYED_CONTRACT_ID_HERE`
- **Explorer:** https://stellar.expert/explorer/testnet/contract/PASTE_YOUR_DEPLOYED_CONTRACT_ID_HERE

## 🔗 Example transaction (contract call)

- **Tx hash:** `PASTE_YOUR_TX_HASH_HERE`
- **Explorer:** https://stellar.expert/explorer/testnet/tx/PASTE_YOUR_TX_HASH_HERE

## 📸 Screenshots

> Add these once you've run the app locally.

**Wallet options available (StellarWalletsKit modal):**

`![wallet options](./docs/wallet-options.png)`

**Live results updating after a vote:**

`![live results](./docs/live-results.png)`

## 🌐 Live demo

`https://your-deployment.vercel.app` (optional)

## 🧪 Testing the contract

```bash
cd contract
cargo test
```

Covers: full vote flow, double-vote rejection, invalid-option rejection.

## 📄 License

MIT
