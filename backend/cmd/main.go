package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/tonykwok/pump-token/backend/config"
	"github.com/tonykwok/pump-token/backend/internal/handler"
	"github.com/tonykwok/pump-token/backend/internal/service"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 加载配置
	cfg := config.LoadConfig()

	// 连接数据库
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 初始化 Solana 客户端
	solanaClient := rpc.New(cfg.Solana.RPCURL)

	// 初始化管理员钱包
	adminWallet, err := solana.PrivateKeyFromBase58(cfg.Solana.AdminWallet)
	if err != nil {
		log.Fatalf("Failed to initialize admin wallet: %v", err)
	}

	// 初始化服务
	contractService, err := service.NewContractService(db, solanaClient, &adminWallet)
	if err != nil {
		log.Fatalf("Failed to initialize contract service: %v", err)
	}

	// 初始化处理器
	contractHandler := handler.NewContractHandler(contractService)

	// 初始化路由
	r := gin.Default()

	// 设置路由组
	api := r.Group("/api")
	{
		// 健康检查
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status": "ok",
			})
		})

		// 合约相关路由
		api.POST("/contracts", contractHandler.DeployContract)
		api.GET("/contracts/:contract_address", contractHandler.GetContract)
		api.GET("/contracts", contractHandler.GetContracts)
	}

	// 启动服务器
	go func() {
		if err := r.Run(cfg.Server.Port); err != nil {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// 优雅关闭
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
}
