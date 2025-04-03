package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tonykwok/pump-token/backend/internal/service"
)

type DeployRequest struct {
	Name                 string    `json:"name"`
	Symbol               string    `json:"symbol"`
	OwnerAddress         string    `json:"ownerAddress"`
	MintPercentage       int       `json:"mintPercentage"`
	MintPrice            float64   `json:"mintPrice"`
	MintLimitPerAddress  int       `json:"mintLimitPerAddress"`
	MintEndDate          time.Time `json:"mintEndDate"`
	AdditionalMintAmount int       `json:"additionalMintAmount"`
}

type DeployResponse struct {
	ContractAddress string `json:"contractAddress"`
	Signature       string `json:"signature"`
}

// ContractHandler 处理合约相关的 HTTP 请求
type ContractHandler struct {
	contractService *service.ContractService
}

// NewContractHandler 创建 ContractHandler 实例
func NewContractHandler(contractService *service.ContractService) *ContractHandler {
	return &ContractHandler{
		contractService: contractService,
	}
}

// DeployContract 部署合约
func (h *ContractHandler) DeployContract(c *gin.Context) {
	var req DeployRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证请求参数
	if err := validateDeployRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 部署合约
	result, err := h.contractService.Deploy(c.Request.Context(), req.OwnerAddress, []byte{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, DeployResponse{
		ContractAddress: result.ContractAddress,
		Signature:       result.Signature,
	})
}

// GetContract 获取合约信息
func (h *ContractHandler) GetContract(c *gin.Context) {
	contractAddress := c.Param("contract_address")
	if contractAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Contract address is required"})
		return
	}

	contract, err := h.contractService.GetContract(c.Request.Context(), contractAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contract)
}

// GetContracts 获取合约列表
func (h *ContractHandler) GetContracts(c *gin.Context) {
	walletAddress := c.Query("wallet_address")
	if walletAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wallet address is required"})
		return
	}

	contracts, err := h.contractService.GetContracts(c.Request.Context(), walletAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contracts)
}

func validateDeployRequest(req DeployRequest) error {
	// 验证基本信息
	if req.Name == "" || req.Symbol == "" {
		return errors.New("代币名称和符号不能为空")
	}

	// 验证 Mint 参数
	if req.MintPercentage <= 0 || req.MintPercentage > 100 {
		return errors.New("Mint 数量百分比必须在 1-100 之间")
	}
	if req.MintPrice <= 0 {
		return errors.New("Mint 价格必须大于 0")
	}
	if req.MintLimitPerAddress <= 0 {
		return errors.New("每地址 Mint 限制必须大于 0")
	}
	if req.MintEndDate.Before(time.Now()) {
		return errors.New("Mint 结束时间必须大于当前时间")
	}
	if req.MintEndDate.After(time.Now().Add(7 * 24 * time.Hour)) {
		return errors.New("Mint 结束时间不能超过一周")
	}

	// 验证流动性参数
	if req.AdditionalMintAmount <= 0 {
		return errors.New("增发资产数量必须大于 0")
	}

	return nil
}

type DeployTokenRequest struct {
	Name        string    `json:"name"`
	Symbol      string    `json:"symbol"`
	TotalSupply int64     `json:"totalSupply"`
	Decimals    int       `json:"decimals"`
	Price       float64   `json:"price"`
	MinAmount   int64     `json:"minAmount"`
	MaxAmount   int64     `json:"maxAmount"`
	StartTime   time.Time `json:"startTime"`
	EndTime     time.Time `json:"endTime"`
}

type DeployTokenResponse struct {
	ContractAddress string `json:"contractAddress"`
}

// DeployToken 部署代币
func (h *ContractHandler) DeployToken(c *gin.Context) {
	var req DeployTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证请求参数
	if req.Name == "" || req.Symbol == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name and symbol are required"})
		return
	}

	if req.TotalSupply <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Total supply must be greater than 0"})
		return
	}

	if req.Decimals < 0 || req.Decimals > 9 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Decimals must be between 0 and 9"})
		return
	}

	if req.Price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Price must be greater than 0"})
		return
	}

	if req.MinAmount <= 0 || req.MaxAmount <= 0 || req.MinAmount > req.MaxAmount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount range"})
		return
	}

	if req.StartTime.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start time must be in the future"})
		return
	}

	if req.EndTime.Before(req.StartTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
		return
	}

	// 部署代币
	contractAddress, err := h.contractService.DeployToken(c.Request.Context(), service.DeployTokenParams{
		Name:        req.Name,
		Symbol:      req.Symbol,
		TotalSupply: req.TotalSupply,
		Decimals:    req.Decimals,
		Price:       req.Price,
		MinAmount:   req.MinAmount,
		MaxAmount:   req.MaxAmount,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deploy token: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, DeployTokenResponse{
		ContractAddress: contractAddress,
	})
}

type DeployContractRequest struct {
	Name                string    `json:"name" binding:"required"`
	Symbol              string    `json:"symbol" binding:"required"`
	Decimals            int       `json:"decimals" binding:"required"`
	TotalSupply         int64     `json:"totalSupply" binding:"required"`
	Price               float64   `json:"price" binding:"required"`
	MinAmount           int64     `json:"minAmount" binding:"required"`
	MaxAmount           int64     `json:"maxAmount" binding:"required"`
	StartTime           time.Time `json:"startTime" binding:"required"`
	EndTime             time.Time `json:"endTime" binding:"required"`
	LiquidityPercentage int       `json:"liquidityPercentage" binding:"required"`
}
