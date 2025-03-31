package solana

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

type Client struct {
	rpcClient *rpc.Client
	programID solana.PublicKey
}

func NewClient(endpoint string, programID string) (*Client, error) {
	pubkey, err := solana.PublicKeyFromBase58(programID)
	if err != nil {
		return nil, fmt.Errorf("invalid program id: %v", err)
	}

	return &Client{
		rpcClient: rpc.New(endpoint),
		programID: pubkey,
	}, nil
}

// DeployProgram 部署合约程序
func (c *Client) DeployProgram(ctx context.Context, payerPrivateKey []byte) (string, error) {
	// 1. 编译合约
	if err := c.buildProgram(); err != nil {
		return "", fmt.Errorf("failed to build program: %v", err)
	}

	// 2. 获取程序二进制文件
	programData, err := c.getProgramBinary()
	if err != nil {
		return "", fmt.Errorf("failed to get program binary: %v", err)
	}

	// 3. 创建部署交易
	tx, err := c.createDeployTransaction(ctx, payerPrivateKey, programData)
	if err != nil {
		return "", fmt.Errorf("failed to create deploy transaction: %v", err)
	}

	// 4. 发送交易
	sig, err := c.rpcClient.SendTransaction(ctx, tx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %v", err)
	}

	return sig.String(), nil
}

// buildProgram 编译合约
func (c *Client) buildProgram() error {
	cmd := exec.Command("anchor", "build")
	cmd.Dir = filepath.Join("..", "pump-token") // 设置工作目录为合约目录

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("build failed: %v, output: %s", err, string(output))
	}

	return nil
}

// getProgramBinary 获取编译后的程序二进制文件
func (c *Client) getProgramBinary() ([]byte, error) {
	// 程序编译后的文件路径
	binaryPath := filepath.Join("..", "pump-token", "target", "deploy", "pump_token.so")

	// 读取二进制文件
	programData, err := os.ReadFile(binaryPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read program binary: %v", err)
	}

	return programData, nil
}

// createDeployTransaction 创建部署交易
func (c *Client) createDeployTransaction(ctx context.Context, payerPrivateKey []byte, programData []byte) (*solana.Transaction, error) {
	// 1. 创建交易
	tx := solana.NewTransaction()

	// 2. 添加创建程序账户指令
	createAccountIx := solana.NewCreateAccountInstruction(
		uint64(len(programData)),    // 程序大小
		solana.PROGRAM_DATA_ACCOUNT, // 所有者
		c.programID,                 // 新账户地址
		solana.SystemProgramID,      // 系统程序
	)
	tx.AddInstruction(createAccountIx)

	// 3. 添加部署程序指令
	deployIx := solana.NewDeployInstruction(
		programData,        // 程序数据
		c.programID,        // 程序ID
		solana.BPFLoaderID, // BPF加载器
	)
	tx.AddInstruction(deployIx)

	// 4. 签名交易
	payer := solana.NewWallet(payerPrivateKey)
	tx.Sign(payer)

	return tx, nil
}

// GetProgramAccount 获取程序账户信息
func (c *Client) GetProgramAccount(ctx context.Context) (*rpc.AccountInfo, error) {
	return c.rpcClient.GetAccountInfo(ctx, c.programID)
}
