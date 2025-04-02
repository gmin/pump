package service

import (
	"context"
	"fmt"
	"time"

	"github.com/tonykwok/pump-token/backend/internal/model"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/programs/token"
	"github.com/gagliardetto/solana-go/rpc"
	"gorm.io/gorm"
)

type DeployTokenParams struct {
	Name        string
	Symbol      string
	TotalSupply int64
	Decimals    int
	Price       float64
	MinAmount   int64
	MaxAmount   int64
	StartTime   time.Time
	EndTime     time.Time
}

type ContractService struct {
	db     *gorm.DB
	solana *SolanaService
	client *rpc.Client
	wallet *solana.PrivateKey
}

func NewContractService(db *gorm.DB, client *rpc.Client, wallet *solana.PrivateKey) (*ContractService, error) {
	solanaService, err := NewSolanaService()
	if err != nil {
		return nil, fmt.Errorf("failed to create solana service: %v", err)
	}

	return &ContractService{
		db:     db,
		solana: solanaService,
		client: client,
		wallet: wallet,
	}, nil
}

// Deploy 部署代币合约
func (s *ContractService) Deploy(ctx context.Context, walletAddress string, programData []byte) (*model.Contract, error) {
	// 1. 创建合约记录
	contract := &model.Contract{
		WalletAddress: walletAddress,
		Status:        "pending",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := s.db.Create(contract).Error; err != nil {
		return nil, fmt.Errorf("failed to create contract record: %v", err)
	}

	// 2. 部署合约
	contractAddress, signature, err := s.solana.DeployProgram(ctx, programData)
	if err != nil {
		contract.Status = "failed"
		s.db.Save(contract)
		return nil, fmt.Errorf("failed to deploy program: %v", err)
	}

	// 3. 更新合约记录
	contract.Status = "success"
	contract.ContractAddress = contractAddress
	contract.Signature = signature
	s.db.Save(contract)

	return contract, nil
}

// GetContract 获取合约信息
func (s *ContractService) GetContract(ctx context.Context, contractAddress string) (*model.Contract, error) {
	var contract model.Contract
	if err := s.db.Where("contract_address = ?", contractAddress).First(&contract).Error; err != nil {
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

func (s *ContractService) DeployToken(ctx context.Context, params DeployTokenParams) (string, error) {
	// 1. 创建代币账户
	tokenAccount, err := solana.NewRandomPrivateKey()
	if err != nil {
		return "", fmt.Errorf("failed to create token account: %w", err)
	}

	// 2. 创建代币账户指令
	createTokenAccountInstruction := solana.NewInstruction(
		token.ProgramID,
		solana.AccountMetaSlice{
			solana.NewAccountMeta(s.wallet.PublicKey(), true, true),     // 支付账户
			solana.NewAccountMeta(tokenAccount.PublicKey(), true, true), // 代币账户
			solana.NewAccountMeta(s.wallet.PublicKey(), true, false),    // 代币所有者
			solana.NewAccountMeta(solana.TokenProgramID, false, false),  // 代币程序
		},
		[]byte{1}, // 1 表示创建代币账户指令
	)

	// 3. 创建交易
	tx, err := solana.NewTransaction(
		[]solana.Instruction{createTokenAccountInstruction},
		solana.Hash{}, // 使用最新的 blockhash
		solana.TransactionPayer(s.wallet.PublicKey()),
	)
	if err != nil {
		return "", fmt.Errorf("failed to create transaction: %w", err)
	}

	// 4. 签名交易
	sig, err := tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(s.wallet.PublicKey()) {
			return s.wallet
		}
		return nil
	})
	if err != nil {
		return "", fmt.Errorf("failed to sign transaction: %w", err)
	}

	// 5. 发送交易
	_, err = s.client.SendTransaction(ctx, tx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %w", err)
	}

	// 6. 等待交易确认
	err = s.solana.WaitForConfirmation(ctx, sig[0].String())
	if err != nil {
		return "", fmt.Errorf("failed to confirm transaction: %w", err)
	}

	return tokenAccount.PublicKey().String(), nil
}
