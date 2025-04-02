import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { apiService } from '../services/api';
import { Token, MintConfig } from '../types';

const ContractDetail: React.FC = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractInfo, setContractInfo] = useState<{ token: Token; config: MintConfig } | null>(null);

  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!contractAddress) return;

      try {
        setLoading(true);
        const info = await apiService.getContractInfo(contractAddress);
        setContractInfo(info);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取合约信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchContractInfo();
  }, [contractAddress]);

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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        合约详情
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            代币信息
          </Typography>
          <Typography variant="body1">
            名称: {token.name}
          </Typography>
          <Typography variant="body1">
            符号: {token.symbol}
          </Typography>
          <Typography variant="body1">
            合约地址: {token.contractAddress}
          </Typography>
          <Typography variant="body1">
            总供应量: {token.totalSupply}
          </Typography>
          <Typography variant="body1">
            小数位数: {token.decimals}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            发行配置
          </Typography>
          <Typography variant="body1">
            价格: {config.price} SOL
          </Typography>
          <Typography variant="body1">
            最小发行量: {config.minAmount}
          </Typography>
          <Typography variant="body1">
            最大发行量: {config.maxAmount}
          </Typography>
          <Typography variant="body1">
            开始时间: {new Date(config.startTime).toLocaleString()}
          </Typography>
          <Typography variant="body1">
            结束时间: {new Date(config.endTime).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContractDetail; 