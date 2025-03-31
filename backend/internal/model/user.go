package model

import (
	"time"
)

type User struct {
	WalletAddress string `gorm:"primaryKey;type:varchar(44)"`
	CreatedAt     time.Time
	LastLoginAt   time.Time
	IsActive      bool `gorm:"default:true"`
}

func (User) TableName() string {
	return "users"
}
