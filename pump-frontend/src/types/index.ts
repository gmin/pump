export interface Token {
  name: string;
  symbol: string;
  contractAddress: string;
  totalSupply: number;
  decimals: number;
}

export interface MintConfig {
  contractAddress: string;
  price: number;
  minAmount: number;
  maxAmount: number;
  startTime: string;
  endTime: string;
}

export interface MintHistory {
  contractAddress: string;
  amount: number;
  price: number;
  totalCost: number;
  timestamp: string;
  status: 'pending' | 'success' | 'failed';
  txHash?: string;
} 