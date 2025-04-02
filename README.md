# 数字资产发行平台

## 项目说明
本项目基于Solana区块链开发，利用Solana的高性能、低费用特性，为用户提供便捷的数字资产发行和质押挖矿服务。

## 一、功能需求描述

### 1. 用户功能模块
- 用户可以通过邮件或者钱包实现注册、登录功能
- 支持免登录，直接钱包使用资产发行功能
- 用户数据安全保护

### 2. 资产发行
#### 2.1 发行参数配置
- mint数量百分比
- mint价格
- 每个地址mint数量限制
- mint有效期（最长1周）
- 流动性迁移参数：
  - 增发的资产数量
  - 流动性来源（mint获取的SOL和增发的token）

#### 2.2 发行规则
- mint时价格固定，申购资产冻结到合约
- mint结束后：
  - 达到设定数量：资产发行成功，用户可claim发行的资产token
  - 未达到设定数量：退回冻结的SOL
- 发行成功后：
  - 按设定增发资产数量自动创建流动性
  - 进入AMM
  - LP token销毁（防rug pull）
- 手续费：
  - mint时收取1%手续费
  - 迁移amm时收取6个sol作为手续费
  - 发行手续费（从发行者收取）
  - 所有手续费进入平台国库池



### 3. 后台管理功能
- 手续费比例配置
- 平台数据统计
- 紧急暂停机制
- 手续费自动进入平台国库池

### 4. 平台支持
- PC端支持
- H5移动端支持

## 二、技术架构

### 1. 后端
- 建议采用Golang实现
- 主要功能：
  - 用户认证
  - 数据存储
  - 业务逻辑
  - API接口
- Solana相关功能：
  - RPC节点交互
  - 交易签名和广播
  - 账户管理
  - 程序部署

### 2. 智能合约（Solana Programs）
- 基于Solana Program开发
- 可复用的合约模板
- 包含：
  - 资产发行合约
  - 质押挖矿合约
  - 流动性管理合约
- Solana特性利用：
  - SPL Token标准
  - Associated Token Accounts
  - Program Derived Addresses (PDAs)
  - Cross-Program Invocation (CPI)

### 3. 前端
- PC端实现
- H5移动端实现
- 主要功能：
  - 钱包连接（支持Phantom等Solana钱包）
  - 资产发行界面
  - 质押挖矿界面
  - 数据展示
- Solana集成：
  - Web3.js集成
  - 交易签名
  - 账户管理
  - 余额查询

### 4. 安全考虑
- 紧急暂停机制
- 合约安全性
- 用户数据保护
- 资金安全
- Solana特定安全考虑：
  - 程序升级机制
  - 权限管理
  - 账户验证
  - 交易确认机制

部署合约 
-> 设置发行参数（mint数量、价格、时间等）
-> 开始mint（收取1%手续费）
-> 冻结资产
-> 检查发行条件
-> 创建Raydium流动性（收取6 SOL手续费）
-> 销毁LP token
-> 销毁所有权限