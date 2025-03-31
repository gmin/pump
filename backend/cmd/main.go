package main

import (
	"backend/config"
	"backend/internal/handler"
	"backend/internal/service"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

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

	// 初始化服务
	contractService := service.NewContractService(cfg, db)

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
		api.GET("/contracts/:mint_address", contractHandler.GetContract)
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
