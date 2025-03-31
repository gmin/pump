import React from 'react';
import { Form, Input, InputNumber, Button, Card, message, Divider, Switch, Select, DatePicker } from 'antd';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { deployContract } from '../services/api';

interface DeployFormData {
  // 基本信息
  name: string;
  symbol: string;
  // Mint 参数
  mintPercentage: number;
  mintPrice: number;
  mintLimitPerAddress: number;
  mintEndDate: moment.Moment;
  // 流动性参数
  additionalMintAmount: number;
  // 质押挖矿参数
  enableStaking: boolean;
  stakingType: 'LP' | 'SINGLE';
  stakingPeriods: {
    months: number;
    percentage: number;
  }[];
}

const { Option } = Select;

const Deploy = () => {
  const { connected, publicKey } = useWallet();
  const [form] = Form.useForm<DeployFormData>();
  const [deploying, setDeploying] = React.useState(false);
  const [enableStaking, setEnableStaking] = React.useState(false);
  const navigate = useNavigate();

  // 验证质押收益分配比例总和是否为100%
  const validateStakingPercentages = (_: any, value: { months: number; percentage: number; }[]) => {
    if (!value || !enableStaking) return Promise.resolve();
    
    const total = value.reduce((sum, period) => sum + (period.percentage || 0), 0);
    if (total !== 100) {
      return Promise.reject('质押收益分配比例总和必须为100%');
    }
    return Promise.resolve();
  };

  const handleDeploy = async (values: DeployFormData) => {
    if (!connected || !publicKey) {
      message.error('请先连接钱包');
      return;
    }

    try {
      setDeploying(true);
      
      const params = {
        name: values.name,
        symbol: values.symbol,
        ownerAddress: publicKey.toString(),
        mintPercentage: values.mintPercentage,
        mintPrice: values.mintPrice,
        mintLimitPerAddress: values.mintLimitPerAddress,
        mintEndDate: values.mintEndDate.toISOString(),
        additionalMintAmount: values.additionalMintAmount,
        enableStaking: values.enableStaking,
        ...(values.enableStaking && {
          stakingType: values.stakingType,
          stakingPeriods: values.stakingPeriods,
        }),
      };

      const result = await deployContract(params);
      message.success('合约部署成功！');
      navigate(`/contracts/${result.contractAddress}`);
    } catch (error) {
      console.error('部署失败:', error);
      message.error('部署失败: ' + (error as Error).message);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div>
      <Card title="部署新合约" style={{ maxWidth: 800, margin: '0 auto' }}>
        {!connected ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p>请先连接钱包以继续</p>
            <WalletMultiButton />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleDeploy}
            initialValues={{
              mintPercentage: 100,
              stakingType: 'SINGLE',
              enableStaking: false,
            }}
          >
            <Divider>基本信息</Divider>
            
            <Form.Item
              label="代币名称"
              name="name"
              rules={[{ required: true, message: '请输入代币名称' }]}
            >
              <Input placeholder="例如: Pump Token" />
            </Form.Item>

            <Form.Item
              label="代币符号"
              name="symbol"
              rules={[{ required: true, message: '请输入代币符号' }]}
            >
              <Input placeholder="例如: PUMP" />
            </Form.Item>

            <Divider>Mint 参数</Divider>

            <Form.Item
              label="Mint 数量百分比"
              name="mintPercentage"
              rules={[{ required: true, message: '请输入 Mint 数量百分比' }]}
              tooltip="可以 Mint 的代币总量百分比"
            >
              <InputNumber
                min={1}
                max={100}
                style={{ width: '100%' }}
                formatter={(value) => `${value}%`}
                parser={(value) => Number(value!.replace('%', ''))}
              />
            </Form.Item>

            <Form.Item
              label="Mint 价格 (SOL)"
              name="mintPrice"
              rules={[{ required: true, message: '请输入 Mint 价格' }]}
              tooltip="每个代币的 Mint 价格（以 SOL 计价）"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="输入 Mint 价格"
                precision={9}
              />
            </Form.Item>

            <Form.Item
              label="每地址 Mint 限制"
              name="mintLimitPerAddress"
              rules={[{ required: true, message: '请输入每地址 Mint 限制' }]}
              tooltip="每个地址最多可以 Mint 的数量"
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="输入每地址限制数量"
              />
            </Form.Item>

            <Form.Item
              label="Mint 结束时间"
              name="mintEndDate"
              rules={[{ required: true, message: '请选择 Mint 结束时间' }]}
              tooltip="Mint 的有效期，最长为一周"
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                disabledDate={(current) => {
                  const today = moment();
                  const oneWeek = moment().add(1, 'week');
                  return current < today || current > oneWeek;
                }}
              />
            </Form.Item>

            <Divider>流动性参数</Divider>

            <Form.Item
              label="增发资产数量"
              name="additionalMintAmount"
              rules={[{ required: true, message: '请输入增发资产数量' }]}
              tooltip="用于创建流动性的增发代币数量"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="输入增发数量"
              />
            </Form.Item>

            <Divider>质押挖矿参数</Divider>

            <Form.Item
              label="启用质押挖矿"
              name="enableStaking"
              valuePropName="checked"
            >
              <Switch onChange={setEnableStaking} />
            </Form.Item>

            {enableStaking && (
              <>
                <Form.Item
                  label="挖矿类型"
                  name="stakingType"
                  rules={[{ required: true, message: '请选择挖矿类型' }]}
                >
                  <Select>
                    <Option value="LP">LP 挖矿</Option>
                    <Option value="SINGLE">单币挖矿</Option>
                  </Select>
                </Form.Item>

                <Form.List
                  name="stakingPeriods"
                  rules={[
                    {
                      validator: validateStakingPercentages,
                    },
                  ]}
                >
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Card key={key} style={{ marginBottom: 16 }}>
                          <Form.Item
                            {...restField}
                            label="质押周期（月）"
                            name={[name, 'months']}
                            rules={[{ required: true, message: '请选择质押周期' }]}
                          >
                            <Select>
                              <Option value={3}>3个月</Option>
                              <Option value={6}>6个月</Option>
                              <Option value={12}>12个月</Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="收益分配比例"
                            name={[name, 'percentage']}
                            rules={[{ required: true, message: '请输入收益分配比例' }]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              style={{ width: '100%' }}
                              formatter={(value) => `${value}%`}
                              parser={(value) => Number(value!.replace('%', ''))}
                            />
                          </Form.Item>

                          <Button type="link" onClick={() => remove(name)}>
                            删除
                          </Button>
                        </Card>
                      ))}

                      <Button type="dashed" onClick={() => add()} block>
                        添加质押周期
                      </Button>
                    </>
                  )}
                </Form.List>
              </>
            )}

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" loading={deploying} block>
                部署合约
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Deploy; 