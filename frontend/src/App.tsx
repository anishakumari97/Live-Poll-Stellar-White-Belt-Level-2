import { useEffect, useRef, useState } from "react";
import { WalletConnect } from "./components/WalletConnect";
import { PollCard } from "./components/PollCard";
import { TxStatusBanner } from "./components/TxStatus";
import { getQuestion, getOptions, getResults, hasVoted, castVote, TxResult } from "./lib/contract";
import { subscribeToVoteEvents } from "./lib/events";
import { CONTRACT_ID, EXPLORER_CONTRACT_URL } from "./lib/config";

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [results, setResults] = useState<Map<number, number>>(new Map());
  const [voted, setVoted] = useState(false);
  const [tx, setTx] = useState<TxResult | null>(null);
  const [error, setError] = useState<{ type: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load static poll data once we have an address to read with.
  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const [q, opts, res, voted] = await Promise.all([
          getQuestion(address),
          getOptions(address),
          getResults(address),
          hasVoted(address),
        ]);
        setQuestion(q);
        setOptions(opts);
        setResults(res);
        setVoted(voted);
      } catch (err) {
        setError({ type: "ContractCallError", message: (err as Error).message });
      }
    })();
  }, [address]);

  // Real-time updates: subscribe to vote events, and as a safety net, also
  // poll get_results every 8s in case an event is missed.
  useEffect(() => {
    if (!address) return;

    unsubscribeRef.current?.();
    unsubscribeRef.current = subscribeToVoteEvents(
      () => {
        getResults(address).then(setResults).catch(() => {});
      },
      (err) => console.warn("event stream error:", err.message)
    );

    const interval = setInterval(() => {
      getResults(address).then(setResults).catch(() => {});
    }, 8000);

    return () => {
      unsubscribeRef.current?.();
      clearInterval(interval);
    };
  }, [address]);

  const handleVote = async (index: number) => {
    if (!address) return;
    setError(null);
    setLoading(true);
    await castVote(address, index, (status) => {
      setTx(status);
      if (status.status === "success") {
        setVoted(true);
        getResults(address).then(setResults).catch(() => {});
      }
      if (status.status === "error") {
        setError({ type: "TransactionError", message: status.error ?? "Unknown error" });
      }
      if (status.status === "success" || status.status === "error") {
        setLoading(false);
      }
    });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>🗳️ Live Poll</h1>
          <p className="subtitle">
            On-chain poll powered by a Soroban smart contract on Stellar Testnet.
          </p>
        </div>
        <WalletConnect
          address={address}
          onConnected={(addr) => {
            setAddress(addr || null);
            setError(null);
          }}
          onError={(err) => setError({ type: err.name, message: err.message })}
        />
      </header>

      {error && (
        <div className="error-banner">
          <strong>{error.type}:</strong> {error.message}
        </div>
      )}

      <TxStatusBanner tx={tx} />

      {address ? (
        <PollCard
          question={question}
          options={options}
          results={results}
          voted={voted}
          address={address}
          disabled={loading}
          onVote={handleVote}
        />
      ) : (
        <div className="poll-card empty-state">
          <p>Connect a Stellar wallet to view live results and vote.</p>
        </div>
      )}

      <footer className="app-footer">
        <a href={`${EXPLORER_CONTRACT_URL}/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
          View contract on Stellar Expert ↗
        </a>
      </footer>
    </div>
  );
}
