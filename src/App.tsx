import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './pages/Home';
import Deploy from './pages/Deploy';
import Contracts from './pages/Contracts';
import ContractDetail from './pages/ContractDetail';
import Transactions from './pages/Transactions';
import Navbar from './components/Navbar';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ padding: 0, background: '#fff' }}>
          <Navbar />
        </Header>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/:address" element={<ContractDetail />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App; 