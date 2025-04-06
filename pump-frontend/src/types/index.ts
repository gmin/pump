export interface Token {
  name: string;
  symbol: string;
  contractAddress: string;
  totalSupply: number;
  decimals: number;
}

export interface MintConfig {
  contractAddress: string;
  minPrice: number;    // 最低价格（SOL）
  maxPrice: number;    // 最高价格（SOL）
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