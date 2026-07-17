import { openWalletModal, getConnectedAddress, disconnectWallet } from "../lib/wallet";

function shorten(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletConnect({
  address,
  onConnected,
  onError,
}: {
  address: string | null;
  onConnected: (address: string) => void;
  onError: (err: Error) => void;
}) {
  const handleConnect = () => {
    openWalletModal(
      async () => {
        try {
          const addr = await getConnectedAddress();
          onConnected(addr);
        } catch (err) {
          onError(err as Error);
        }
      },
      onError
    );
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onConnected("");
  };

  if (address) {
    return (
      <div className="wallet-pill">
        <span className="wallet-dot" />
        <span>{shorten(address)}</span>
        <button className="link-btn" onClick={handleDisconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button className="btn primary" onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}
