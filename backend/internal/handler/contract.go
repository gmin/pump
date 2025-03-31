package handler

import (
	"backend/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ContractHandler struct {
	contractService *service.ContractService
}

func NewContractHandler(contractService *service.ContractService) *ContractHandler {
	return &ContractHandler{
		contractService: contractService,
	}
}

// DeployContract 部署合约
func (h *ContractHandler) DeployContract(c *gin.Context) {
	var req struct {
		WalletAddress string `json:"wallet_address" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	contract, err := h.contractService.DeployContract(c.Request.Context(), req.WalletAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contract)
}

// GetContract 获取合约信息
func (h *ContractHandler) GetContract(c *gin.Context) {
	mintAddress := c.Param("mint_address")
	contract, err := h.contractService.GetContract(c.Request.Context(), mintAddress)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contract)
}

// GetContracts 获取用户的合约列表
func (h *ContractHandler) GetContracts(c *gin.Context) {
	walletAddress := c.Query("wallet_address")
	if walletAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet_address is required"})
		return
	}

	contracts, err := h.contractService.GetContracts(c.Request.Context(), walletAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contracts)
}
