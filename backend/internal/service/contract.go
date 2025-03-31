package service

import (
	"backend/config"
	"backend/internal/model"
	"context"
	"fmt"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"gorm.io/gorm"
)

type ContractService struct {
	config *config.Config
	db     *gorm.DB
	client *rpc.Client
}

func NewContractService(config *config.Config, db *gorm.DB) *ContractService {
	return &ContractService{
		config: config,
		db:     db,
		client: rpc.New(config.Solana.RPCURL),
	}
}

// DeployContract 部署合约并收取手续费
func (s *ContractService) DeployContract(ctx context.Context, walletAddress string) (*model.Contract, error) {
	// 1. 创建合约记录
	contract := &model.Contract{
		WalletAddress: walletAddress,
		Status:        "pending",
		FeeAmount:     s.config.Solana.MinFee,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := s.db.Create(contract).Error; err != nil {
		return nil, fmt.Errorf("failed to create contract record: %v", err)
	}

	// 2. 创建Solana客户端
	client := solana.NewClient(s.config.Solana.RPCURL)

	// 3. 创建交易
	tx, err := s.createDeployTransaction(ctx, walletAddress)
	if err != nil {
		contract.Status = "failed"
		s.db.Save(contract)
		return nil, fmt.Errorf("failed to create transaction: %v", err)
	}

	// 4. 发送交易
	sig, err := client.SendTransaction(ctx, tx)
	if err != nil {
		contract.Status = "failed"
		s.db.Save(contract)
		return nil, fmt.Errorf("failed to send transaction: %v", err)
	}

	// 5. 等待确认
	status, err := client.WaitForTransactionConfirmation(ctx, sig)
	if err != nil {
		contract.Status = "failed"
		s.db.Save(contract)
		return nil, fmt.Errorf("failed to confirm transaction: %v", err)
	}

	if status.Err != nil {
		contract.Status = "failed"
		s.db.Save(contract)
		return nil, fmt.Errorf("transaction failed: %v", status.Err)
	}

	// 6. 更新合约记录
	contract.Status = "success"
	contract.MintAddress = sig.String() // 这里需要从交易中获取实际的Mint地址
	s.db.Save(contract)

	return contract, nil
}

// createDeployTransaction 创建部署合约的交易
func (s *ContractService) createDeployTransaction(ctx context.Context, walletAddress string) (*solana.Transaction, error) {
	// TODO: 实现合约部署交易创建逻辑
	// 1. 创建程序账户
	// 2. 部署程序
	// 3. 初始化程序
	// 4. 添加手续费转账指令
	return nil, nil
}

// GetContract 获取合约信息
func (s *ContractService) GetContract(ctx context.Context, mintAddress string) (*model.Contract, error) {
	var contract model.Contract
	if err := s.db.Where("mint_address = ?", mintAddress).First(&contract).Error; err != nil {
		return nil, fmt.Errorf("contract not found: %v", err)
	}
	return &contract, nil
}

// GetContracts 获取用户的合约列表
func (s *ContractService) GetContracts(ctx context.Context, walletAddress string) ([]*model.Contract, error) {
	var contracts []*model.Contract
	if err := s.db.Where("wallet_address = ?", walletAddress).Find(&contracts).Error; err != nil {
		return nil, fmt.Errorf("failed to get contracts: %v", err)
	}
	return contracts, nil
}
