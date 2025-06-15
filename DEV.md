# Solana代币发行与流动性添加方案

## 一、代币基本信息
- 代币地址：`6Lo3fh6JrVMzYZS9WdzUijaqsj1qWAFvXAWnXMWLGiDp`
- 小数位数：9
- 代币账户：`D7dxRjwtuWiv9y9W84ex8iZaLoSLNaVvc34nPAPFmakd`

## 二、发行流程

### 1. 初始发行阶段
```bash
# 1.1 创建代币（已完成）
spl-token create-token

# 1.2 创建销售合约账户
spl-token create-account <TOKEN_ADDRESS> --owner <SALE_CONTRACT_ADDRESS>

# 1.3 铸造初始销售代币（例如：总量的30%）
spl-token mint <TOKEN_ADDRESS> <INITIAL_AMOUNT>
```

### 2. 销售阶段
- 销售合约功能：
  - 接收SOL支付
  - 验证支付金额
  - 转移代币给购买者
  - 记录销售状态

### 3. 流动性添加阶段
```bash
# 3.1 铸造剩余代币（例如：总量的70%）
spl-token mint <TOKEN_ADDRESS> <REMAINING_AMOUNT>

# 3.2 创建流动性池
# 3.3 添加代币和SOL流动性
```

## 三、技术实现细节

### 1. 销售合约设计
```rust
// 伪代码
pub struct SaleContract {
    // 代币地址
    pub token_mint: Pubkey,
    // 销售价格（SOL）
    pub price: u64,
    // 销售总量
    pub total_amount: u64,
    // 已售数量
    pub sold_amount: u64,
    // 销售状态
    pub status: SaleStatus,
}

// 销售状态
pub enum SaleStatus {
    Active,
    Completed,
    Cancelled,
}
```

### 2. 流动性添加设计
```rust
// 伪代码
pub struct LiquidityPool {
    // 代币地址
    pub token_mint: Pubkey,
    // 流动性池地址
    pub pool_address: Pubkey,
    // 代币数量
    pub token_amount: u64,
    // SOL数量
    pub sol_amount: u64,
}
```

## 四、安全考虑

1. 代币铸造权限
   - 初始铸造后锁定铸造权限
   - 销售完成后解锁用于流动性添加

2. 销售合约安全
   - 价格固定且不可更改
   - 销售总量限制
   - 防止重入攻击

3. 流动性添加安全
   - 确保销售已完成
   - 验证添加的流动性比例
   - 防止价格操纵

## 五、后续扩展

1. 可添加功能：
   - 销售时间限制
   - 白名单机制
   - 分级价格
   - 锁仓机制

2. 监控功能：
   - 销售进度
   - 流动性状态
   - 价格走势 