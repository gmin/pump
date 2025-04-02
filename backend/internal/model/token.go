package model

import (
	"time"

	"gorm.io/gorm"
)

// Token 代币模型
type Token struct {
	gorm.Model
	Name            string    `gorm:"not null"`                  // 代币名称
	Symbol          string    `gorm:"not null"`                  // 代币符号
	ContractAddress string    `gorm:"uniqueIndex;not null"`      // 合约地址
	TotalSupply     int64     `gorm:"not null"`                  // 总供应量
	Decimals        int       `gorm:"not null"`                  // 代币精度
	Price           float64   `gorm:"not null"`                  // 发行价格
	MinAmount       int64     `gorm:"not null"`                  // 最小购买数量
	MaxAmount       int64     `gorm:"not null"`                  // 最大购买数量
	StartTime       time.Time `gorm:"not null"`                  // 开始时间
	EndTime         time.Time `gorm:"not null"`                  // 结束时间
	Status          string    `gorm:"not null;default:'active'"` // 状态：active, completed, cancelled
	CreatorAddress  string    `gorm:"not null"`                  // 创建者地址
}

// MintHistory Mint 历史记录
type MintHistory struct {
	gorm.Model
	TokenID         uint    `gorm:"not null"`                   // 代币 ID
	Token           Token   `gorm:"foreignKey:TokenID"`         // 关联的代币
	Amount          int64   `gorm:"not null"`                   // 购买数量
	Price           float64 `gorm:"not null"`                   // 购买价格
	TotalCost       float64 `gorm:"not null"`                   // 总成本
	BuyerAddress    string  `gorm:"not null"`                   // 购买者地址
	TransactionHash string  `gorm:"uniqueIndex;not null"`       // 交易哈希
	Status          string  `gorm:"not null;default:'pending'"` // 状态：pending, success, failed
}

// TableName 指定表名
func (Token) TableName() string {
	return "tokens"
}
