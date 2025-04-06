import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useWallet } from '../hooks/useWallet';
import { apiService } from '../services/api';
import { Token, MintConfig } from '../types';

const Mint: React.FC = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const { connected, address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractInfo, setContractInfo] = useState<{ token: Token; config: MintConfig } | null>(null);
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!contractAddress) return;

      try {
        setLoading(true);
        const info = await apiService.getContractInfo(contractAddress);
        setContractInfo(info);
        // 设置默认价格为最低价格
        setPrice(info.config.minPrice.toString());
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取合约信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchContractInfo();
  }, [contractAddress]);

  const handleMint = async () => {
    if (!contractAddress || !amount || !price) return;

    try {
      setMinting(true);
      setError(null);
      const response = await apiService.mintToken(contractAddress, Number(amount), Number(price));
      console.log('Mint 成功:', response);
      // TODO: 显示成功消息并跳转到合约详情页
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mint 失败');
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!contractInfo) {
    return (
      <Box p={3}>
        <Alert severity="warning">未找到合约信息</Alert>
      </Box>
    );
  }

  const { token, config } = contractInfo;
  const now = new Date();
  const startTime = new Date(config.startTime);
  const endTime = new Date(config.endTime);
  const isMintActive = now >= startTime && now <= endTime;

  const totalCost = Number(amount) * Number(price);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        购买代币
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {token.name} ({token.symbol})
          </Typography>
          <Typography variant="body1" gutterBottom>
            合约地址: {token.contractAddress}
          </Typography>
          <Typography variant="body1" gutterBottom>
            价格范围: {config.minPrice} - {config.maxPrice} SOL
          </Typography>
          <Typography variant="body1" gutterBottom>
            发行量范围: {config.minAmount} - {config.maxAmount}
          </Typography>
          <Typography variant="body1" gutterBottom>
            开始时间: {startTime.toLocaleString()}
          </Typography>
          <Typography variant="body1" gutterBottom>
            结束时间: {endTime.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            购买信息
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="输入购买数量"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!isMintActive || !connected}
                inputProps={{ min: config.minAmount, max: config.maxAmount }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="输入价格 (SOL)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={!isMintActive || !connected}
                inputProps={{ min: config.minPrice, max: config.maxPrice, step: 0.000000001 }}
              />
            </Grid>
          </Grid>
          {amount && price && (
            <Typography variant="h6" sx={{ mt: 2 }}>
              总价: {totalCost} SOL
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleMint}
            disabled={!isMintActive || !connected || !amount || !price || minting}
            sx={{ mt: 2 }}
          >
            {minting ? <CircularProgress size={24} /> : '购买'}
          </Button>
          {!connected && (
            <Typography color="error" sx={{ mt: 1 }}>
              请先连接钱包
            </Typography>
          )}
          {!isMintActive && (
            <Typography color="error" sx={{ mt: 1 }}>
              {now < startTime ? '发行尚未开始' : '发行已结束'}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Mint; 