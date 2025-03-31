package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Solana   SolanaConfig
}

type ServerConfig struct {
	Port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type JWTConfig struct {
	Secret string
}

type SolanaConfig struct {
	RPCURL      string
	ProgramID   string
	AdminWallet string
	FeeRate     float64
	MinFee      float64
}

var GlobalConfig Config

func LoadConfig() *Config {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")

	if err := viper.ReadInConfig(); err != nil {
		panic(err)
	}

	if err := viper.Unmarshal(&GlobalConfig); err != nil {
		panic(err)
	}

	return &GlobalConfig
}
