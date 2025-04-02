package types

import "time"

// ActiveMint 表示正在 Mint 的项目信息
type ActiveMint struct {
	ContractAddress     string    `json:"contractAddress"`
	Name                string    `json:"name"`
	Symbol              string    `json:"symbol"`
	Price               float64   `json:"price"`
	MintPercentage      float64   `json:"mintPercentage"`
	MintLimitPerAddress int64     `json:"mintLimitPerAddress"`
	MintEndDate         time.Time `json:"mintEndDate"`
	TotalSupply         int64     `json:"totalSupply"`
}

// MintConfig 表示 Mint 配置信息
type MintConfig struct {
	ContractAddress     string    `json:"contractAddress"`
	Price               float64   `json:"price"`
	MaxAmount           int64     `json:"maxAmount"`
	MinAmount           int64     `json:"minAmount"`
	StartTime           time.Time `json:"startTime"`
	EndTime             time.Time `json:"endTime"`
	LiquidityPercentage float64   `json:"liquidityPercentage"`
	StakingPercentage   float64   `json:"stakingPercentage"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
}

// TokenInfo 表示代币基本信息
type TokenInfo struct {
	ContractAddress string    `json:"contractAddress"`
	Name            string    `json:"name"`
	Symbol          string    `json:"symbol"`
	Decimals        int       `json:"decimals"`
	TotalSupply     int64     `json:"totalSupply"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}
