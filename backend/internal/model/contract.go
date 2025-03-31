package model

import (
	"time"
)

type Contract struct {
	ID            uint    `gorm:"primaryKey"`
	MintAddress   string  `gorm:"uniqueIndex;type:varchar(44)"`
	WalletAddress string  `gorm:"type:varchar(44)"`
	FeeAmount     float64 `gorm:"type:decimal(20,9)"`
	Status        string  `gorm:"type:varchar(20)"` // pending, success, failed
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

func (Contract) TableName() string {
	return "contracts"
}
