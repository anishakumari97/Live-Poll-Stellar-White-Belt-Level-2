# Live Poll ✦ Stellar Soroban Smart Poll Portal

**Live Poll** is a premium, real-time decentralized voting and polling application built on the **Stellar Soroban Smart Contract Platform**. It provides a sleek, modern interface that connects multiple browser extension wallets, tracks contract state through transaction simulation, and streams ledger event logs in real-time.

---

## 🚀 Verifiable Testnet Deployment

The smart contract is compiled, deployed, initialized, and seeded on the **Stellar Testnet**:

*   **Smart Contract Address:** `CC4GI6ZAZQZRC5OKA6MVLLVAXNZXRBK6UUCONVXWCSXGWHMVJDFREYM2`
    *   *Verify on Stellar.expert:* [Stellar Explorer Contract Link](https://stellar.expert/explorer/testnet/contract/CC4GI6ZAZQZRC5OKA6MVLLVAXNZXRBK6UUCONVXWCSXGWHMVJDFREYM2)
*   **WASM Upload Transaction Hash:** `c0c108cb7a73eb422d41f6ee9a4c1d250671a1c345378a42d7c4ab99a0f6636e`
    *   *Verify on Stellar.expert:* [WASM Upload Tx Details](https://stellar.expert/explorer/testnet/tx/c0c108cb7a73eb422d41f6ee9a4c1d250671a1c345378a42d7c4ab99a0f6636e)
*   **Contract Instantiation Transaction Hash:** `320cc7f1c21b46fca1738e6627086288475ad126e35a97ce005b33c0c1c277fd`
    *   *Verify on Stellar.expert:* [Instantiation Tx Details](https://stellar.expert/explorer/testnet/tx/320cc7f1c21b46fca1738e6627086288475ad126e35a97ce005b33c0c1c277fd)
*   **Contract Initialization (`initialize`) Transaction Hash:** `b4ae1fd3cf36f395166671ae41fc881dd86925872bd6b41e15cb315629bbcb6b`
    *   *Verify on Stellar.expert:* [Initialization Tx Details](https://stellar.expert/explorer/testnet/tx/b4ae1fd3cf36f395166671ae41fc881dd86925872bd6b41e15cb315629bbcb6b)

### Seeded Poll Details (Default State)
The initial poll has been successfully initialized on-chain:
*   **Question:** `"What's your favorite Stellar wallet?"`
*   **Options:** `["Freighter", "xBull", "Lobstr", "Albedo"]`

---

## 🛡️ Core Features & Level 2 Requirements Met

### 1. Multi-Wallet Integration
*   Powered by the wrapper **StellarWalletsKit** with `allowAllModules()` enabled to support Freighter, xBull, Albedo, Lobstr, Hana, Rabet, WalletConnect, and Ledger.

### 2. Comprehensive Error Handling
*   Explicit custom errors catch common pitfalls including `WalletNotFoundError`, `UserRejectedError`, `InsufficientBalanceError`, `NetworkError`, and `ContractCallError` to display user-friendly notices.

### 3. Real-Time Event Sync
*   Subscribes to the contract's `vote` events by polling the Soroban RPC `getEvents` endpoint, enabling the frontend to update the vote distributions dynamically for all active clients without manual refreshing.

---

## 💻 Local Setup & Development

### 1. Clone & Configure Environments
Configure the contract credentials in your environment file:
```bash
cd frontend
cp .env.example .env
```
Inside your `.env` file, configure the following:
```env
VITE_CONTRACT_ID=CC4GI6ZAZQZRC5OKA6MVLLVAXNZXRBK6UUCONVXWCSXGWHMVJDFREYM2
```

### 2. Install & Start Development Server
```bash
npm install
npm run dev
```

---

## 🧪 Testing the Contract
To run the automated tests verifying double-voting protection and boundary options:
```bash
cd contract
cargo test
```

---

## 📄 License

MIT
