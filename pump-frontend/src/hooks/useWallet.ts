import { useState, useCallback } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

export const useWallet = () => {
  const { publicKey, connected, connect, disconnect } = useSolanaWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    try {
      await connect();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接钱包失败');
    }
  }, [connect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '断开钱包失败');
    }
  }, [disconnect]);

  return {
    walletAddress: publicKey?.toBase58() || null,
    connected,
    connect: handleConnect,
    disconnect: handleDisconnect,
    error,
  };
}; 