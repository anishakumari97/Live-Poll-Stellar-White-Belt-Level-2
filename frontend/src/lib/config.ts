// ---------------------------------------------------------------------------
// Fill these in AFTER you deploy the contract (see DEPLOY.md).
// ---------------------------------------------------------------------------

export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const EXPLORER_TX_URL = "https://stellar.expert/explorer/testnet/tx";
export const EXPLORER_CONTRACT_URL =
  "https://stellar.expert/explorer/testnet/contract";

// Paste the Contract ID printed by:
//   stellar contract deploy --wasm ... --network testnet
export const CONTRACT_ID =
  import.meta.env.VITE_CONTRACT_ID ?? "CC4GI6ZAZQZRC5OKA6MVLLVAXNZXRBK6UUCONVXWCSXGWHMVJDFREYM2";
