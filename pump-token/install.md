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

待补充部署步骤... 