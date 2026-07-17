import {
  Contract,
  rpc,
  TransactionBuilder,
  Account,
  scValToNative,
  nativeToScVal,
  Address,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "./config";
import { signXdr, normalizeWalletError, ContractCallError } from "./wallet";

export type TxStatus = "idle" | "building" | "pending" | "success" | "error";

export interface TxResult {
  status: TxStatus;
  hash?: string;
  error?: string;
}

const server = new rpc.Server(RPC_URL);

/** Read-only contract call: simulate a transaction, don't submit it. */
async function readContract(method: string, args: unknown[], sourcePubKey: string) {
  const contract = new Contract(CONTRACT_ID);
  const account = await getAccountForRead(sourcePubKey);

  const scArgs = args.map((a) => toScVal(a));
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(sim)) {
    throw new ContractCallError(sim.error);
  }
  if (!sim.result?.retval) {
    return undefined;
  }
  return scValToNative(sim.result.retval);
}

async function getAccountForRead(sourcePubKey: string): Promise<Account> {
  try {
    return await server.getAccount(sourcePubKey);
  } catch {
    // Account not found on-chain (e.g. brand new, unfunded) — simulation of a
    // read-only call still works with a zeroed sequence number.
    return new Account(sourcePubKey, "0");
  }
}

function toScVal(value: unknown) {
  if (value instanceof Address) {
    return value.toScVal();
  }
  if (typeof value === "string" && value.startsWith("G") && value.length === 56) {
    return new Address(value).toScVal();
  }
  return nativeToScVal(value);
}

// ---------------------------------------------------------------------------
// Public read helpers
// ---------------------------------------------------------------------------

export async function getQuestion(readerAddress: string): Promise<string> {
  return readContract("get_question", [], readerAddress);
}

export async function getOptions(readerAddress: string): Promise<string[]> {
  return readContract("get_options", [], readerAddress);
}

export async function getResults(readerAddress: string): Promise<Map<number, number>> {
  const raw = await readContract("get_results", [], readerAddress);
  // scValToNative decodes a Soroban Map<u32,u32> into a plain JS object
  // keyed by stringified numbers (e.g. { "0": 2, "1": 0 }), not a JS Map —
  // normalize it here so the rest of the app can rely on a real Map.
  const map = new Map<number, number>();
  for (const [key, value] of Object.entries(raw ?? {})) {
    map.set(Number(key), Number(value));
  }
  return map;
}

export async function hasVoted(readerAddress: string): Promise<boolean> {
  return readContract("has_voted", [new Address(readerAddress)], readerAddress);
}

// ---------------------------------------------------------------------------
// Write: cast a vote, with full status tracking (pending -> success/error)
// ---------------------------------------------------------------------------

export async function castVote(
  voterAddress: string,
  optionIndex: number,
  onStatus: (r: TxResult) => void
): Promise<void> {
  try {
    onStatus({ status: "building" });

    const account = await server.getAccount(voterAddress);
    const contract = new Contract(CONTRACT_ID);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call("vote", new Address(voterAddress).toScVal(), nativeToScVal(optionIndex, { type: "u32" }))
      )
      .setTimeout(60)
      .build();

    const prepared = await server.prepareTransaction(tx);

    const signedXdr = await signXdr(prepared.toXDR(), voterAddress);

    onStatus({ status: "pending" });

    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const sendResult = await server.sendTransaction(signedTx);

    if (sendResult.status === "ERROR") {
      throw new ContractCallError(
        `Transaction failed to submit: ${JSON.stringify(sendResult.errorResult)}`
      );
    }

    const hash = sendResult.hash;
    const finalStatus = await pollTransactionStatus(hash);

    if (finalStatus === "SUCCESS") {
      onStatus({ status: "success", hash });
    } else {
      onStatus({ status: "error", hash, error: `Transaction ${finalStatus.toLowerCase()} on-chain.` });
    }
  } catch (err) {
    const normalized = normalizeWalletError(err);
    onStatus({ status: "error", error: normalized.message });
  }
}

async function pollTransactionStatus(hash: string, attempts = 15, delayMs = 2000): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    await new Promise((res) => setTimeout(res, delayMs));
    const result = await server.getTransaction(hash);
    if (result.status !== "NOT_FOUND") {
      return result.status;
    }
  }
  return "TIMEOUT";
}
