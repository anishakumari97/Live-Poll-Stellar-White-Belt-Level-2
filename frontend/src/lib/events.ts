import { rpc, scValToNative, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { CONTRACT_ID, RPC_URL } from "./config";

const server = new rpc.Server(RPC_URL);

// getEvents topic filters must be base64-encoded XDR ScVal segments, not
// plain strings — this encodes the "vote" symbol our contract emits as the
// first topic segment.
const VOTE_TOPIC_FILTER = nativeToScVal("vote", { type: "symbol" }).toXDR("base64");

export interface VoteEvent {
  voter: string;
  optionIndex: number;
  ledger: number;
  txHash: string;
}

/**
 * Polls Soroban RPC's getEvents for `vote` events emitted by this contract,
 * starting a few ledgers behind the current tip. This is what drives the
 * "live" part of the live poll — no page refresh needed.
 */
export function subscribeToVoteEvents(
  onEvent: (e: VoteEvent) => void,
  onError?: (err: Error) => void
): () => void {
  let stopped = false;
  let cursorLedger: number | null = null;

  const poll = async () => {
    if (stopped) return;
    try {
      const latest = await server.getLatestLedger();
      if (cursorLedger === null) {
        cursorLedger = Math.max(latest.sequence - 100, 1);
      }

      const res = await server.getEvents({
        startLedger: cursorLedger,
        filters: [
          {
            type: "contract",
            contractIds: [CONTRACT_ID],
            topics: [[VOTE_TOPIC_FILTER]],
          },
        ],
        limit: 50,
      });

      for (const event of res.events) {
        const topicVals = event.topic.map((t: xdr.ScVal) => scValToNative(t));
        const voter = topicVals[1];
        const optionIndex = scValToNative(event.value);
        onEvent({
          voter: typeof voter === "string" ? voter : voter?.toString?.() ?? String(voter),
          optionIndex: Number(optionIndex),
          ledger: event.ledger,
          txHash: event.txHash,
        });
      }

      if (res.events.length > 0) {
        cursorLedger = res.events[res.events.length - 1].ledger + 1;
      } else if (res.latestLedger) {
        cursorLedger = Math.min(cursorLedger, res.latestLedger);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (!stopped) {
        setTimeout(poll, 4000);
      }
    }
  };

  poll();

  return () => {
    stopped = true;
  };
}
