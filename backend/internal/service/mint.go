package service

import (
	"context"
	"database/sql"
	"time"

	"github.com/tonykwok/pump-token/backend/internal/errors"
	"github.com/tonykwok/pump-token/backend/internal/types"
)

// MintService 处理 Mint 相关的业务逻辑
type MintService struct {
	db *sql.DB
}

// NewMintService 创建 MintService 实例
func NewMintService(db *sql.DB) *MintService {
	return &MintService{db: db}
}

// GetActiveMints 获取正在 Mint 的项目列表
func (s *MintService) GetActiveMints(ctx context.Context) ([]types.ActiveMint, error) {
	now := time.Now()

	// 查询所有正在 Mint 的项目
	query := `
		SELECT 
			m.contract_address,
			t.name,
			t.symbol,
			m.price,
			m.staking_percentage,
			m.max_amount,
			m.end_time,
			t.total_supply
		FROM mint_configs m
		JOIN tokens t ON m.contract_address = t.contract_address
		WHERE m.start_time <= $1 AND m.end_time > $1
		ORDER BY m.created_at DESC
	`

	rows, err := s.db.QueryContext(ctx, query, now)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mints []types.ActiveMint
	for rows.Next() {
		var mint types.ActiveMint
		var endTime time.Time
		err := rows.Scan(
			&mint.ContractAddress,
			&mint.Name,
			&mint.Symbol,
			&mint.Price,
			&mint.MintPercentage,
			&mint.MintLimitPerAddress,
			&endTime,
			&mint.TotalSupply,
		)
		if err != nil {
			return nil, err
		}
		mint.MintEndDate = endTime
		mints = append(mints, mint)
	}

	return mints, nil
}

// GetMintInfo 获取单个项目的 Mint 信息
func (s *MintService) GetMintInfo(ctx context.Context, contractAddress, walletAddress string) (*types.ActiveMint, error) {
	// 查询 Mint 配置和代币信息
	query := `
		SELECT 
			m.contract_address,
			t.name,
			t.symbol,
			m.price,
			m.staking_percentage,
			m.max_amount,
			m.end_time,
			t.total_supply,
			COALESCE(SUM(mr.amount), 0) as user_minted
		FROM mint_configs m
		JOIN tokens t ON m.contract_address = t.contract_address
		LEFT JOIN mint_records mr ON m.contract_address = mr.contract_address 
			AND mr.wallet_address = $1
		WHERE m.contract_address = $2
		GROUP BY m.contract_address, t.name, t.symbol, m.price, m.staking_percentage, 
			m.max_amount, m.end_time, t.total_supply
	`

	var mint types.ActiveMint
	var endTime time.Time
	var userMinted int64

	err := s.db.QueryRowContext(ctx, query, walletAddress, contractAddress).Scan(
		&mint.ContractAddress,
		&mint.Name,
		&mint.Symbol,
		&mint.Price,
		&mint.MintPercentage,
		&mint.MintLimitPerAddress,
		&endTime,
		&mint.TotalSupply,
		&userMinted,
	)
	if err != nil {
		return nil, err
	}

	mint.MintEndDate = endTime
	return &mint, nil
}

// Mint 执行 Mint 操作
func (s *MintService) Mint(ctx context.Context, contractAddress, walletAddress string, amount int64) error {
	// 开始事务
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 检查 Mint 配置
	var maxAmount int64
	var startTime, endTime time.Time
	err = tx.QueryRowContext(ctx, `
		SELECT max_amount, start_time, end_time
		FROM mint_configs
		WHERE contract_address = $1
	`, contractAddress).Scan(&maxAmount, &startTime, &endTime)
	if err != nil {
		return err
	}

	// 检查是否在 Mint 期间
	now := time.Now()
	if now.Before(startTime) || now.After(endTime) {
		return errors.ErrMintPeriodNotActive
	}

	// 检查用户已 Mint 数量
	var userMinted int64
	err = tx.QueryRowContext(ctx, `
		SELECT COALESCE(SUM(amount), 0)
		FROM mint_records
		WHERE contract_address = $1 AND wallet_address = $2
	`, contractAddress, walletAddress).Scan(&userMinted)
	if err != nil {
		return err
	}

	if userMinted+amount > maxAmount {
		return errors.ErrExceededMintLimit
	}

	// 创建 Mint 记录
	_, err = tx.ExecContext(ctx, `
		INSERT INTO mint_records (contract_address, wallet_address, amount, price, timestamp)
		VALUES ($1, $2, $3, $4, $5)
	`, contractAddress, walletAddress, amount, 0, now)
	if err != nil {
		return err
	}

	// 提交事务
	return tx.Commit()
}
