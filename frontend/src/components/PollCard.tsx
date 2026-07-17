interface Props {
  question: string;
  options: string[];
  results: Map<number, number>;
  voted: boolean;
  address: string | null;
  disabled: boolean;
  onVote: (index: number) => void;
}

export function PollCard({ question, options, results, voted, address, disabled, onVote }: Props) {
  const total = Array.from(results.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="poll-card">
      <h2>{question || "Loading question…"}</h2>
      <div className="options">
        {options.map((opt, i) => {
          const count = results.get(i) ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={i} className="option-row">
              <button
                className="option-btn"
                disabled={disabled || voted || !address}
                onClick={() => onVote(i)}
              >
                {opt}
              </button>
              <div className="result-bar-track">
                <div className="result-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="result-meta">
                {count} vote{count === 1 ? "" : "s"} · {pct}%
              </span>
            </div>
          );
        })}
      </div>
      <p className="poll-footer">
        {total} total vote{total === 1 ? "" : "s"}
        {voted && " · You already voted on this poll"}
        {!address && " · Connect a wallet to vote"}
      </p>
    </div>
  );
}
