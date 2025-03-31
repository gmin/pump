package service

import (
	"backend/config"
	"backend/internal/model"
	"backend/pkg/solana"
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type ContractService struct {
	config *config.Config
	db     *gorm.DB
	solana *solana.Client
}

func NewContractService(config *config.Config, db *gorm.DB) (*ContractService, error) {
	client, err := solana.NewClient(config.Solana.RPCURL, config.Solana.ProgramID)
	if err != nil {
		return nil, fmt.Errorf("failed to create solana client: %v", err)
	}

	return &ContractService{
		config: config,
		db:     db,
		solana: client,
	}, nil
}

// DeployContract 部署合约并收取手续费
func (s *ContractService) DeployContract(ctx context.Context, walletAddress string, payerPrivateKey []byte) (*model.Contract, error) {
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

	// 2. 部署合约
	sig, err := s.solana.DeployProgram(ctx, payerPrivateKey)
	if err != nil {
		contract.Status = "failed"
		s.db.Save(contract)
		return nil, fmt.Errorf("failed to deploy program: %v", err)
	}

	// 3. 更新合约记录
	contract.Status = "success"
	contract.MintAddress = sig
	s.db.Save(contract)

	return contract, nil
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

// VerifyDeployment 验证合约是否部署成功
func (s *ContractService) VerifyDeployment(ctx context.Context, mintAddress string) (bool, error) {
	// 1. 获取合约记录
	contract, err := s.GetContract(ctx, mintAddress)
	if err != nil {
		return false, err
	}

	// 2. 检查合约账户是否存在
	account, err := s.solana.GetProgramAccount(ctx)
	if err != nil {
		return false, fmt.Errorf("failed to get program account: %v", err)
	}

	// 3. 如果账户存在且是程序账户,则部署成功
	if account != nil && account.Owner.Equals(solana.BPFLoaderID) {
		return true, nil
	}

	return false, nil
}
