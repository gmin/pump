package model

import (
	"time"
)

// Contract 合约模型
type Contract struct {
	ID              uint   `gorm:"primaryKey"`
	ContractAddress string `gorm:"uniqueIndex;type:varchar(44)"` // 合约地址
	WalletAddress   string `gorm:"type:varchar(44)"`             // 部署钱包地址
	Status          string `gorm:"type:varchar(20)"`             // pending, success, failed
	Signature       string `gorm:"type:varchar(88)"`             // 交易签名
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// TableName 指定表名
func (Contract) TableName() string {
	return "contracts"
}
