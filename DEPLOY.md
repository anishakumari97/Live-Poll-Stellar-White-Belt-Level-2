# Deploying the contract to Stellar Testnet

You'll need the Rust toolchain + `stellar` CLI (formerly `soroban-cli`) installed
locally. This must be run on your own machine — it can't be done inside this
sandbox.

## 1. Install prerequisites

```bash
# Rust + wasm target
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Stellar CLI
cargo install --locked stellar-cli --features opt
```

## 2. Create and fund a deployer identity

```bash
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet
stellar keys address deployer   # copy this — this is your admin address
```

## 3. Build the contract

```bash
cd contract
stellar contract build
# wasm output lands at target/wasm32-unknown-unknown/release/live_poll_contract.wasm
```

## 4. Deploy to testnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/live_poll_contract.wasm \
  --source deployer \
  --network testnet
```

This prints a **Contract ID** (starts with `C...`). Save it — this is what
goes in the README and in the frontend's `.env`.

## 5. Initialize the poll (one-time)

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- \
  initialize \
  --admin <YOUR_ADMIN_ADDRESS> \
  --question "What's your favorite Stellar wallet?" \
  --options '["Freighter","xBull","Lobstr","Albedo"]'
```

## 6. Wire it into the frontend

```bash
cd ../frontend
cp .env.example .env
# edit .env and paste your CONTRACT_ID
npm install
npm run dev
```

## 7. Get a transaction hash for your README

Open the app, connect a wallet (e.g. Freighter set to Testnet, funded via
https://friendbot.stellar.org), and cast a vote. Copy the resulting tx hash
from the success banner or from Stellar Expert.

## 8. Verify everything on Stellar Expert

- Contract: `https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>`
- Transaction: `https://stellar.expert/explorer/testnet/tx/<TX_HASH>`
