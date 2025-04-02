package model

import (
	"time"
)

// Mint 代币发行配置模型
type Mint struct {
	ID              uint      `gorm:"primarykey"`
	ContractAddress string    `gorm:"uniqueIndex;not null"` // 合约地址
	Price           string    `gorm:"not null"`             // 发行价格
	MaxAmount       string    `gorm:"not null"`             // 最大发行量
	MinAmount       string    `gorm:"not null"`             // 最小发行量
	StartTime       time.Time `gorm:"not null"`             // 开始时间
	EndTime         time.Time `gorm:"not null"`             // 结束时间
	CreatedAt       time.Time // 创建时间
	UpdatedAt       time.Time // 更新时间
}

// TableName 指定表名
func (Mint) TableName() string {
	return "mints"
}
