package handler

import (
	"net/http"
	"strconv"

	"github.com/tonykwok/pump-token/backend/internal/service"

	"github.com/gin-gonic/gin"
)

// MintHandler 处理 Mint 相关的 HTTP 请求
type MintHandler struct {
	mintService *service.MintService
}

// NewMintHandler 创建 MintHandler 实例
func NewMintHandler(mintService *service.MintService) *MintHandler {
	return &MintHandler{
		mintService: mintService,
	}
}

// GetActiveMints 获取正在 Mint 的项目列表
func (h *MintHandler) GetActiveMints(c *gin.Context) {
	mints, err := h.mintService.GetActiveMints(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "获取 Mint 项目列表失败",
		})
		return
	}

	c.JSON(http.StatusOK, mints)
}

// GetMintInfo 获取单个项目的 Mint 信息
func (h *MintHandler) GetMintInfo(c *gin.Context) {
	contractAddress := c.Param("contractAddress")
	walletAddress := c.Query("walletAddress")

	if contractAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "合约地址不能为空",
		})
		return
	}

	mint, err := h.mintService.GetMintInfo(c.Request.Context(), contractAddress, walletAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "获取 Mint 信息失败",
		})
		return
	}

	c.JSON(http.StatusOK, mint)
}

// Mint 执行 Mint 操作
func (h *MintHandler) Mint(c *gin.Context) {
	var req struct {
		ContractAddress string `json:"contractAddress" binding:"required"`
		WalletAddress   string `json:"walletAddress" binding:"required"`
		Amount          string `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "请求参数错误",
		})
		return
	}

	amount, err := strconv.ParseInt(req.Amount, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Mint 数量格式错误",
		})
		return
	}

	if err := h.mintService.Mint(c.Request.Context(), req.ContractAddress, req.WalletAddress, amount); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Mint 操作失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Mint 操作成功",
	})
}
