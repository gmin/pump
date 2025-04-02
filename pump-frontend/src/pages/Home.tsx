import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Token, MintConfig, MintHistory } from '../types';
import { useWallet } from '../hooks/useWallet';
import { TextField } from '@mui/material';

interface DeployFormData {
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

const Home: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [mintConfigs, setMintConfigs] = useState<MintConfig[]>([]);
  const [mintHistory, setMintHistory] = useState<MintHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { walletAddress, connect, disconnect } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<DeployFormData>({
    name: '',
    symbol: '',
    totalSupply: 1000000,
    decimals: 9,
    price: 0.1,
    minAmount: 100,
    maxAmount: 10000,
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tokensData, configsData, historyData] = await Promise.all([
          apiService.getTokens(),
          apiService.getMintConfigs(),
          apiService.getMintHistory(),
        ]);
        setTokens(tokensData);
        setMintConfigs(configsData);
        setMintHistory(historyData);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.deployToken(formData);
      setSuccess(`代币部署成功！合约地址: ${response.contractAddress}`);
      // 重置表单
      setFormData({
        name: '',
        symbol: '',
        totalSupply: 1000000,
        decimals: 9,
        price: 0.1,
        minAmount: 100,
        maxAmount: 10000,
        startTime: '',
        endTime: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '部署失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const now = new Date();
  const activeMints = mintConfigs.filter(config => {
    const startTime = new Date(config.startTime);
    const endTime = new Date(config.endTime);
    return now >= startTime && now <= endTime;
  });

  const successfulMints = mintHistory.filter(record => record.status === 'success');

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        代币发行平台
      </Typography>

      {/* 部署表单区域 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            发行新代币
          </Typography>
          {!walletAddress ? (
            <Box>
              <Typography variant="body1" gutterBottom>
                请先连接钱包以发行代币
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                <Box>
                  <TextField
                    required
                    fullWidth
                    label="代币名称"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    label="代币符号"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="总供应量"
                    name="totalSupply"
                    value={formData.totalSupply}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="小数位数"
                    name="decimals"
                    value={formData.decimals}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="发行价格 (SOL)"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="最小购买数量"
                    name="minAmount"
                    value={formData.minAmount}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="最大购买数量"
                    name="maxAmount"
                    value={formData.maxAmount}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    type="datetime-local"
                    label="开始时间"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    type="datetime-local"
                    label="结束时间"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box gridColumn="span 2" display="flex" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : '发行代币'}
                  </Button>
                </Box>
              </Box>
            </form>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 正在 Mint 的项目区域 */}
      <Box mb={6}>
        <Typography variant="h4" component="h2" gutterBottom>
          正在 Mint 的项目
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {activeMints.map((config) => {
            const token = tokens.find((t) => t.contractAddress === config.contractAddress);
            if (!token) return null;

            return (
              <Card key={config.contractAddress}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {token.name} ({token.symbol})
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    合约地址: {token.contractAddress}
                  </Typography>
                  <Typography variant="body2">
                    价格: {config.price} SOL
                  </Typography>
                  <Typography variant="body2">
                    发行量范围: {config.minAmount} - {config.maxAmount}
                  </Typography>
                  <Typography variant="body2">
                    开始时间: {new Date(config.startTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    结束时间: {new Date(config.endTime).toLocaleString()}
                  </Typography>
                </CardContent>
                <Box p={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/mint/${token.contractAddress}`)}
                  >
                    购买
                  </Button>
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* 已 Mint 成功的项目区域 */}
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          已 Mint 成功的项目
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {successfulMints.map((record) => {
            const token = tokens.find((t) => t.contractAddress === record.contractAddress);
            if (!token) return null;

            return (
              <Card key={`${record.contractAddress}-${record.timestamp}`}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {token.name} ({token.symbol})
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    合约地址: {token.contractAddress}
                  </Typography>
                  <Typography variant="body2">
                    购买数量: {record.amount}
                  </Typography>
                  <Typography variant="body2">
                    单价: {record.price} SOL
                  </Typography>
                  <Typography variant="body2">
                    总价: {record.totalCost} SOL
                  </Typography>
                  <Typography variant="body2">
                    交易时间: {new Date(record.timestamp).toLocaleString()}
                  </Typography>
                  {record.txHash && (
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      交易哈希: {record.txHash}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Home; 