import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const Navbar = () => {
  const location = useLocation();

  const menuItems = [
    { key: '/', label: <Link to="/">首页</Link> },
    { key: '/deploy', label: <Link to="/deploy">部署合约</Link> },
    { key: '/contracts', label: <Link to="/contracts">合约列表</Link> },
    { key: '/transactions', label: <Link to="/transactions">交易历史</Link> },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ flex: 1 }}
      />
      <WalletMultiButton />
    </div>
  );
};

export default Navbar; 