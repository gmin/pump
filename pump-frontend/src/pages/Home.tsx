import { Card, Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        欢迎使用 Pump Token 部署平台
      </h1>
      
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card title="部署新合约" hoverable>
            <p>创建新的代币合约，设置代币参数和发行规则</p>
            <Link to="/deploy">
              <Button type="primary">开始部署</Button>
            </Link>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="管理合约" hoverable>
            <p>查看和管理已部署的合约，监控合约状态</p>
            <Link to="/contracts">
              <Button type="primary">查看合约</Button>
            </Link>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="交易历史" hoverable>
            <p>查看所有合约相关的交易记录</p>
            <Link to="/transactions">
              <Button type="primary">查看历史</Button>
            </Link>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home; 