import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { apiService } from '../services/api';
import { MintHistory } from '../types';

const MintHistoryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<MintHistory[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await apiService.getMintHistory();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取历史记录失败');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusColor = (status: MintHistory['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: MintHistory['status']) => {
    switch (status) {
      case 'success':
        return '成功';
      case 'pending':
        return '处理中';
      case 'failed':
        return '失败';
      default:
        return status;
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mint 历史记录
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>合约地址</TableCell>
              <TableCell align="right">数量</TableCell>
              <TableCell align="right">单价 (SOL)</TableCell>
              <TableCell align="right">总价 (SOL)</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>时间</TableCell>
              <TableCell>交易哈希</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((record, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {record.contractAddress}
                </TableCell>
                <TableCell align="right">{record.amount}</TableCell>
                <TableCell align="right">{record.price}</TableCell>
                <TableCell align="right">{record.totalCost}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(record.status)}
                    color={getStatusColor(record.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  {record.txHash ? (
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {record.txHash}
                    </Typography>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MintHistoryPage; 