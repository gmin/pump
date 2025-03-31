import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // 根据实际后端地址修改

export interface StakingPeriod {
  months: number;
  percentage: number;
}

export interface DeployContractParams {
  // 基本信息
  name: string;
  symbol: string;
  ownerAddress: string;
  
  // Mint 参数
  mintPercentage: number;
  mintPrice: number;
  mintLimitPerAddress: number;
  mintEndDate: string; // ISO 格式的日期字符串
  
  // 流动性参数
  additionalMintAmount: number;
  
  // 质押挖矿参数
  enableStaking: boolean;
  stakingType?: 'LP' | 'SINGLE';
  stakingPeriods?: StakingPeriod[];
}

export interface DeployResponse {
  contractAddress: string;
  transactionHash: string;
}

export const deployContract = async (params: DeployContractParams): Promise<DeployResponse> => {
  const response = await axios.post(`${API_BASE_URL}/contracts/deploy`, params);
  return response.data;
}; 