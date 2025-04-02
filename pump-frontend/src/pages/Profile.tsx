import React from 'react';
import { Card, Typography, Space } from 'antd';
import { useWallet } from '@solana/wallet-adapter-react';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { publicKey, connected } = useWallet();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>个人中心</Title>
      
      <Card title="钱包信息">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text>连接状态：</Text>
            <Text strong>{connected ? '已连接' : '未连接'}</Text>
          </div>
          {connected && publicKey && (
            <div>
              <Text>钱包地址：</Text>
              <Text strong>{publicKey.toString()}</Text>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Profile; 