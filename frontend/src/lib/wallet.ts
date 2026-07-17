import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";
import { NETWORK_PASSPHRASE } from "./config";

// ---------------------------------------------------------------------------
// Typed error classes — these map directly to the "3+ error types handled"
// requirement. Each one is caught and surfaced distinctly in the UI.
// ---------------------------------------------------------------------------

export class WalletNotFoundError extends Error {
  constructor(walletName = "Wallet") {
    super(`${walletName} is not installed or could not be reached.`);
    this.name = "WalletNotFoundError";
  }
}

export class UserRejectedError extends Error {
  constructor(message = "You rejected the request in your wallet.") {
    super(message);
    this.name = "UserRejectedError";
  }
}

export class InsufficientBalanceError extends Error {
  constructor(message = "This account doesn't have enough XLM to cover the transaction fee/reserve.") {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Could not reach the Stellar network. Check your connection and try again.") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ContractCallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractCallError";
  }
}

/**
 * Normalizes whatever the wallet kit / RPC throws into one of our typed
 * errors above so the UI can branch on `error.name`.
 */
export function normalizeWalletError(err: unknown): Error {
  const message = (err instanceof Error ? err.message : String(err)).toLowerCase();

  if (message.includes("not installed") || message.includes("not detected") || message.includes("no wallet")) {
    return new WalletNotFoundError();
  }
  if (
    message.includes("reject") ||
    message.includes("declined") ||
    message.includes("user cancelled") ||
    message.includes("user canceled") ||
    message.includes("denied")
  ) {
    return new UserRejectedError();
  }
  if (
    message.includes("insufficient") ||
    message.includes("underfunded") ||
    message.includes("tx_insufficient_balance") ||
    message.includes("op_underfunded")
  ) {
    return new InsufficientBalanceError();
  }
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("failed to fetch")
  ) {
    return new NetworkError();
  }
  return new ContractCallError(err instanceof Error ? err.message : String(err));
}

export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export function openWalletModal(
  onSelected: (option: ISupportedWallet) => void,
  onError: (err: Error) => void
) {
  try {
    kit.openModal({
      onWalletSelected: (option) => {
        try {
          kit.setWallet(option.id);
          onSelected(option);
        } catch (err) {
          onError(normalizeWalletError(err));
        }
      },
      onClosed: (err) => {
        if (err) onError(normalizeWalletError(err));
      },
    });
  } catch (err) {
    onError(normalizeWalletError(err));
  }
}

export async function getConnectedAddress(): Promise<string> {
  try {
    const { address } = await kit.getAddress();
    return address;
  } catch (err) {
    throw normalizeWalletError(err);
  }
}

export async function signXdr(xdr: string, address: string): Promise<string> {
  try {
    const { signedTxXdr } = await kit.signTransaction(xdr, {
      address,
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    return signedTxXdr;
  } catch (err) {
    throw normalizeWalletError(err);
  }
}

export function disconnectWallet() {
  kit.disconnect();
}
