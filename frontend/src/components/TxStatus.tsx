import { TxResult } from "../lib/contract";
import { EXPLORER_TX_URL } from "../lib/config";

export function TxStatusBanner({ tx }: { tx: TxResult | null }) {
  if (!tx || tx.status === "idle") return null;

  const config: Record<string, { label: string; className: string }> = {
    building: { label: "Preparing transaction…", className: "tx-banner tx-pending" },
    pending: { label: "Submitted — waiting for network confirmation…", className: "tx-banner tx-pending" },
    success: { label: "Vote confirmed on-chain ✅", className: "tx-banner tx-success" },
    error: { label: `Failed: ${tx.error ?? "unknown error"}`, className: "tx-banner tx-error" },
  };

  const c = config[tx.status];

  return (
    <div className={c.className}>
      <span className="tx-spinner" data-active={tx.status === "building" || tx.status === "pending"} />
      <span>{c.label}</span>
      {tx.hash && (
        <a href={`${EXPLORER_TX_URL}/${tx.hash}`} target="_blank" rel="noreferrer" className="tx-link">
          View on Stellar Expert ↗
        </a>
      )}
    </div>
  );
}
