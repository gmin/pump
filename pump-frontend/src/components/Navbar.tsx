import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useWallet } from '../hooks/useWallet';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar: React.FC = () => {
  useWallet(); // 保持钱包连接状态

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Pump Token
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" href="/">
            首页
          </Button>
          <Button color="inherit" href="/deploy">
            部署
          </Button>
          <Button color="inherit" href="/history">
            历史记录
          </Button>
          <WalletMultiButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 