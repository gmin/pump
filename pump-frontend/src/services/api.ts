import axios from 'axios';
import { Token as TokenType, MintConfig as MintConfigType, MintHistory } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 代币接口
export interface Token {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  createdAt: string;
  updatedAt: string;
}

// 代币发行配置接口
export interface MintConfig {
  contractAddress: string;
  price: string;
  maxAmount: string;
  minAmount: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

// 合约接口
export interface Contract {
  contractAddress: string;
  walletAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DeployTokenRequest {
  name: string;
  symbol: string;
  totalSupply: number;
  decimals: number;
  price: number;
  minAmount: number;
  maxAmount: number;
  startTime: string;
  endTime: string;
}

interface DeployTokenResponse {
  contractAddress: string;
}

// API 函数
export const apiService = {
  // 获取代币列表
  getTokens: async (): Promise<TokenType[]> => {
    const response = await api.get('/tokens');
    return response.data;
  },

  // 获取代币发行配置
  getMintConfigs: async (): Promise<MintConfigType[]> => {
    const response = await api.get('/mint-configs');
    return response.data;
  },

  // 获取合约详情
  getContractInfo: async (contractAddress: string): Promise<{ token: TokenType; config: MintConfigType }> => {
    const [tokenResponse, configResponse] = await Promise.all([
      api.get(`/tokens/${contractAddress}`),
      api.get(`/mint-configs/${contractAddress}`),
    ]);
    return {
      token: tokenResponse.data,
      config: configResponse.data,
    };
  },

  // 部署合约
  deployContract: async (data: {
    name: string;
    symbol: string;
    totalSupply: number;
    decimals: number;
    price: number;
    minAmount: number;
    maxAmount: number;
    startTime: string;
    endTime: string;
  }): Promise<{ contractAddress: string }> => {
    const response = await api.post('/contracts/deploy', data);
    return response.data;
  },

  // 购买代币
  mintToken: async (contractAddress: string, amount: number, price: number): Promise<{ txHash: string }> => {
    const response = await api.post(`/mint/${contractAddress}`, { amount, price });
    return response.data;
  },

  // 代币相关
  async getToken(contractAddress: string): Promise<Token> {
    const response = await api.get(`/api/tokens/${contractAddress}`);
    return response.data;
  },

  // 代币发行相关
  async getMintConfig(contractAddress: string): Promise<MintConfig> {
    const response = await api.get(`/api/mints/${contractAddress}`);
    return response.data;
  },

  async createMintConfig(config: Omit<MintConfig, 'contractAddress' | 'createdAt' | 'updatedAt'>): Promise<MintConfig> {
    const response = await api.post('/api/mints', config);
    return response.data;
  },

  // 合约相关
  async getContract(contractAddress: string): Promise<Contract> {
    const response = await api.get(`/api/contracts/${contractAddress}`);
    return response.data;
  },

  async getContracts(walletAddress: string): Promise<Contract[]> {
    const response = await api.get(`/api/contracts?walletAddress=${walletAddress}`);
    return response.data;
  },

  // 获取 Mint 历史
  getMintHistory: async (): Promise<MintHistory[]> => {
    const response = await api.get('/mint-history');
    return response.data;
  },

  deployToken: async (data: DeployTokenRequest): Promise<DeployTokenResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/tokens/deploy`, data);
    return response.data;
  },
}; 