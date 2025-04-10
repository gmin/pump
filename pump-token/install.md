# Pump Token

Solana 智能合约项目，使用 Anchor 框架开发。

## 环境要求

### Linux (Ubuntu 22.04 x64)
- Rust 1.86.0
- Solana 1.17.34
- Anchor 0.28.0

### macOS
- Rust 1.86.0
- Solana 1.17.34
- Anchor 0.28.0
- Xcode Command Line Tools

## 环境配置步骤

### Linux 环境配置

#### 1. 安装系统依赖
```bash
sudo apt update
sudo apt install -y build-essential pkg-config libssl-dev libudev-dev
```

#### 2. 安装 Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```

#### 3. 安装 Solana
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
```

#### 4. 更新 Solana 工具链
```bash
solana-install update
```

#### 5. 安装 Anchor
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.28.0
avm use 0.28.0
```

### macOS 环境配置

#### 1. 安装 Xcode Command Line Tools
```bash
xcode-select --install
```

#### 2. 安装 Homebrew（如果未安装）
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 3. 安装系统依赖
```bash
brew install pkg-config openssl
```

#### 4. 安装 Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```

#### 5. 安装 Solana
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

#### 6. 更新 Solana 工具链
```bash
solana-install update
```

#### 7. 安装 Anchor
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.28.0
avm use 0.28.0
```

## 项目配置

### 安装 Node.js 依赖
```bash
# 进入项目目录
cd pump-token

# 安装依赖
npm install
# 或者使用 yarn
yarn install
```

### Cargo.toml 配置
```toml
[package]
name = "pump-token"
version = "0.1.0"
description = "Created with Anchor"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "pump_token"

[features]
default = ["no-entrypoint"]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]

[dependencies]
anchor-lang = { version = "0.25.0", features = ["init-if-needed"] }
anchor-spl = { version = "0.25.0", features = ["metadata"] }
```

## 编译步骤

1. 确保所有依赖已安装
2. 执行编译命令：
```bash
anchor build
```

编译成功后，将在 `target/deploy` 目录下生成：
- `pump_token.so` - 可部署的 Solana 程序
- `pump_token-keypair.json` - 程序密钥对

## 验证安装

检查各个组件的版本：
```bash
rustc --version  # 应显示 1.86.0
solana --version  # 应显示 1.17.34
anchor --version  # 应显示 0.28.0
```

## 常见问题

### Linux 环境
1. 如果遇到 GLIBC 版本问题，确保使用兼容的 Anchor 版本
2. 如果编译失败，检查 Cargo.toml 中的 crate-type 配置
3. 确保 Solana 工具链已正确更新

### macOS 环境
1. 如果遇到 OpenSSL 相关错误，确保正确设置了 OpenSSL 环境变量：
```bash
export OPENSSL_ROOT_DIR=$(brew --prefix openssl)
export OPENSSL_LIB_DIR=$(brew --prefix openssl)/lib
```
2. 如果遇到权限问题，确保已正确安装 Xcode Command Line Tools
3. 如果遇到路径问题，确保正确设置了 PATH 环境变量

## 部署

### 1. 切换到测试网
```bash
# 切换到 Solana 测试网
solana config set --url devnet

# 验证当前网络
solana config get
```

### 2. 创建或导入钱包
```bash
# 创建新钱包（如果还没有）
solana-keygen new --outfile deploy-wallet.json

# 或者导入现有钱包
# solana-keygen recover 'your-seed-phrase' --outfile deploy-wallet.json
```

### 3. 获取测试网 SOL
```bash
# 查看当前钱包地址
solana address -k deploy-wallet.json

# 使用水龙头获取测试网 SOL（每次 2 SOL）
solana airdrop 2 $(solana address -k deploy-wallet.json)
```

### 4. 部署合约
```bash
# 确保在项目根目录
cd pump-token

# 使用 Anchor 部署
anchor deploy --provider.cluster devnet

# 或者使用 Solana CLI 部署
solana program deploy target/deploy/pump_token.so --program-id target/deploy/pump_token-keypair.json
```

### 5. 验证部署
```bash
# 查看程序信息
solana program show $(solana address -k target/deploy/pump_token-keypair.json)

# 查看程序日志
solana logs $(solana address -k target/deploy/pump_token-keypair.json)
```

### 注意事项
1. 部署前确保有足够的测试网 SOL（建议至少 2 SOL）
2. 保存好部署钱包的密钥文件（deploy-wallet.json）
3. 记录下部署后的程序地址，后续交互需要使用
4. 如果部署失败，检查：
   - 网络连接是否正常
   - 钱包余额是否充足
   - 程序是否编译成功
   - 密钥文件权限是否正确

### 常见问题
1. 如果遇到 "Error: Account not found"：
   - 确认钱包地址正确
   - 确认已经获取了测试网 SOL

2. 如果遇到 "Error: Program failed to complete"：
   - 检查程序大小是否超过限制
   - 确认程序编译正确

3. 如果遇到 "Error: Transaction simulation failed"：
   - 检查程序逻辑是否正确
   - 确认所有依赖都已正确安装

# Pump Token 部署信息

## 程序信息
- 程序 ID（合约地址）：`7nVQ3g2ypfPFDpHS6wrvH1omCxaJ7MUg3fHU7UkDRhkA`
- 部署网络：Devnet
- 部署文件：`target/deploy/pump_token.so`
- 程序大小：433KB

## 部署账户
- 升级权限：`/Users/tonykwok/.config/solana/id.json`
- 账户租金：1141440 lamports (约 0.001 SOL)

## 部署钱包信息
- 部署钱包地址：`CChExWbRZN78LDtxKxQvYupigkEgVYr5BhAcehsbhi3c`
- 部署钱包密钥文件：`/Users/tonykwok/.config/solana/id.json`
- 程序密钥对文件：`target/deploy/pump_token-keypair.json`

## 程序功能
1. 代币初始化 (`initializeToken`)
2. 代币元数据更新 (`updateTokenMetadata`)
3. 管理员功能
   - 更新管理员 (`updateAdmin`)
   - 更新国库地址 (`updateTreasury`)
   - 暂停代币 (`pauseToken`)
   - 恢复代币 (`unpauseToken`)
4. 代币操作
   - 铸造代币 (`mintToken`)
   - 销毁代币 (`burnToken`)
5. 代币账户管理
   - 创建代币账户 (`createTokenAccount`)
   - 关闭代币账户 (`closeTokenAccount`)
6. 代币转账
   - 转账代币 (`transferToken`)
   - 授权转账 (`approveToken`)
   - 执行授权转账 (`transferFromToken`)
7. 代币销毁
   - 销毁代币账户 (`burnTokenAccount`)
8. 代币账户管理
   - 冻结代币账户 (`freezeTokenAccount`)
   - 解冻代币账户 (`thawTokenAccount`)

## 部署步骤
1. 构建项目：`anchor build`
2. 部署项目：`anchor deploy`

## 注意事项
- 确保 `declare_id!` 中的程序 ID 与部署的程序 ID 匹配
- 部署前确保账户有足够的 SOL 支付租金
- 建议在 Devnet 上充分测试后再部署到主网