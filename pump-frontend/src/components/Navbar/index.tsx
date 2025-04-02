import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '../../hooks/useWallet';

const Navbar: React.FC = () => {
  const { walletAddress } = useWallet();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Pump Token
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            首页
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/history"
          >
            历史记录
          </Button>
          <WalletMultiButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 