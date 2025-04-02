package router

import (
	"database/sql"

	"github.com/tonykwok/pump-token/backend/internal/handler"
	"github.com/tonykwok/pump-token/backend/internal/service"

	"github.com/gin-gonic/gin"
)

// SetupRouter 设置路由
func SetupRouter(db *sql.DB) *gin.Engine {
	r := gin.Default()

	// 创建服务实例
	mintService := service.NewMintService(db)

	// 创建处理器实例
	mintHandler := handler.NewMintHandler(mintService)

	// API 路由组
	api := r.Group("/api")
	{
		// Mint 相关路由
		mint := api.Group("/mint")
		{
			mint.GET("/active", mintHandler.GetActiveMints)
			mint.GET("/:contractAddress", mintHandler.GetMintInfo)
			mint.POST("/mint", mintHandler.Mint)
		}
	}

	return r
}
