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
	// 1. 获取最新的区块哈希
	recent, err := c.rpcClient.GetRecentBlockhash(ctx, rpc.CommitmentFinalized)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %v", err)
	}

	// 2. 创建私钥和公钥
	privKey := solana.PrivateKey(payerPrivateKey)
	payer := privKey.PublicKey()

	// 3. 准备指令
	instructions := make([]solana.Instruction, 0)

	// 4. 添加创建程序账户指令
	createAccountIx := solana.NewInstruction(
		solana.SystemProgramID,
		solana.AccountMetaSlice{
			solana.NewAccountMeta(payer, true, true),                     // 支付账户
			solana.NewAccountMeta(c.programID, true, true),               // 新程序账户
			solana.NewAccountMeta(solana.SysVarRentPubkey, false, false), // 租金账户
		},
		[]byte{0, 0, 0, 0, 0, 0, 0, 0}, // 创建账户指令数据
	)
	instructions = append(instructions, createAccountIx)

	// 5. 添加部署程序指令
	deployIx := solana.NewInstruction(
		solana.BPFLoaderProgramID,
		solana.AccountMetaSlice{
			solana.NewAccountMeta(c.programID, true, true),                // 程序账户
			solana.NewAccountMeta(payer, true, false),                     // 支付账户
			solana.NewAccountMeta(solana.SysVarRentPubkey, false, false),  // 租金账户
			solana.NewAccountMeta(solana.SysVarClockPubkey, false, false), // 时钟账户
		},
		programData,
	)
	instructions = append(instructions, deployIx)

	// 6. 创建交易
	tx, err := solana.NewTransaction(
		instructions,
		recent.Value.Blockhash,
		solana.TransactionPayer(payer),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %v", err)
	}

	// 7. 签名交易
	_, err = tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(payer) {
			return &privKey
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to sign transaction: %v", err)
	}

	return tx, nil
}

// GetProgramAccount 获取程序账户信息
func (c *Client) GetProgramAccount(ctx context.Context) (*rpc.GetAccountInfoResult, error) {
	return c.rpcClient.GetAccountInfo(ctx, c.programID)
}
