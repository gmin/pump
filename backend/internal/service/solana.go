package service

import (
	"context"
	"encoding/binary"
	"fmt"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

type SolanaService struct {
	client *rpc.Client
	wallet *solana.PrivateKey
}

func NewSolanaService() (*SolanaService, error) {
	// 连接到 Solana devnet
	client := rpc.New(rpc.DevNet_RPC)

	// 从环境变量或配置文件中读取私钥
	// TODO: 从配置文件读取私钥
	privateKey := []byte("your_private_key_here")
	wallet := solana.PrivateKey(privateKey)

	return &SolanaService{
		client: client,
		wallet: &wallet,
	}, nil
}

// GetBalance 获取账户余额
func (s *SolanaService) GetBalance(ctx context.Context, address string) (uint64, error) {
	pubKey, err := solana.PublicKeyFromBase58(address)
	if err != nil {
		return 0, fmt.Errorf("invalid public key: %w", err)
	}

	balance, err := s.client.GetBalance(ctx, pubKey, rpc.CommitmentFinalized)
	if err != nil {
		return 0, fmt.Errorf("failed to get balance: %w", err)
	}

	return balance.Value, nil
}

// SendTransaction 发送交易
func (s *SolanaService) SendTransaction(ctx context.Context, instructions []solana.Instruction) (string, error) {
	// 创建交易
	tx, err := solana.NewTransaction(
		instructions,
		solana.Hash{}, // 使用最新的 blockhash
		solana.TransactionPayer(s.wallet.PublicKey()),
	)
	if err != nil {
		return "", fmt.Errorf("failed to create transaction: %w", err)
	}

	// 签名交易
	sig, err := tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(s.wallet.PublicKey()) {
			return s.wallet
		}
		return nil
	})
	if err != nil {
		return "", fmt.Errorf("failed to sign transaction: %w", err)
	}

	// 发送交易
	_, err = s.client.SendTransaction(ctx, tx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %w", err)
	}

	return sig[0].String(), nil
}

// WaitForConfirmation 等待交易确认
func (s *SolanaService) WaitForConfirmation(ctx context.Context, signature string) error {
	sig, err := solana.SignatureFromBase58(signature)
	if err != nil {
		return fmt.Errorf("invalid signature: %w", err)
	}

	// 轮询检查交易状态
	for {
		opts := &rpc.GetTransactionOpts{
			Encoding: solana.EncodingBase64,
		}
		status, err := s.client.GetTransaction(ctx, sig, opts)
		if err != nil {
			return fmt.Errorf("failed to get transaction status: %w", err)
		}

		if status != nil {
			if status.Meta != nil && status.Meta.Err != nil {
				return fmt.Errorf("transaction failed: %v", status.Meta.Err)
			}
			if status.BlockTime != nil {
				return nil
			}
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			// 等待一段时间后继续检查
			time.Sleep(time.Second)
		}
	}
}

// DeployProgram 部署 Solana 程序
func (s *SolanaService) DeployProgram(ctx context.Context, programData []byte) (string, string, error) {
	// 1. 获取最新的区块哈希
	recent, err := s.client.GetRecentBlockhash(ctx, rpc.CommitmentFinalized)
	if err != nil {
		return "", "", fmt.Errorf("获取最新区块哈希失败: %v", err)
	}

	// 2. 创建程序账户
	programKeypair, err := solana.NewRandomPrivateKey()
	if err != nil {
		return "", "", fmt.Errorf("创建程序账户失败: %v", err)
	}

	// 3. 计算程序账户所需的空间
	programSize := uint64(len(programData))
	// 添加一些额外的空间用于程序元数据
	programSize += 8  // 用于存储程序大小
	programSize += 32 // 用于存储程序所有者

	// 4. 计算创建账户所需的 lamports
	// 每个字节需要 1 lamport，加上一些额外的空间用于程序元数据
	lamports := programSize * 1

	// 5. 创建账户指令
	instructionData := make([]byte, 9)
	instructionData[0] = 1 // 1 表示创建账户指令
	binary.LittleEndian.PutUint64(instructionData[1:], lamports)
	binary.LittleEndian.PutUint64(instructionData[9:], programSize)

	createAccountInstruction := solana.NewInstruction(
		solana.SystemProgramID,
		solana.AccountMetaSlice{
			solana.NewAccountMeta(s.wallet.PublicKey(), true, true),       // 支付账户
			solana.NewAccountMeta(programKeypair.PublicKey(), true, true), // 新程序账户
		},
		instructionData,
	)

	// 6. 创建交易
	tx, err := solana.NewTransaction(
		[]solana.Instruction{createAccountInstruction},
		recent.Value.Blockhash,
		solana.TransactionPayer(s.wallet.PublicKey()),
	)
	if err != nil {
		return "", "", fmt.Errorf("创建交易失败: %v", err)
	}

	// 7. 签名交易
	_, err = tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(s.wallet.PublicKey()) {
			return s.wallet
		}
		if key.Equals(programKeypair.PublicKey()) {
			return &programKeypair
		}
		return nil
	})
	if err != nil {
		return "", "", fmt.Errorf("签名交易失败: %v", err)
	}

	// 8. 发送交易
	sig, err := s.client.SendTransaction(ctx, tx)
	if err != nil {
		return "", "", fmt.Errorf("发送交易失败: %v", err)
	}

	// 9. 等待交易确认
	timeout := time.After(60 * time.Second)
	for {
		select {
		case <-ctx.Done():
			return "", "", fmt.Errorf("等待交易确认超时")
		case <-timeout:
			return "", "", fmt.Errorf("等待交易确认超时")
		default:
			status, err := s.client.GetSignatureStatuses(ctx, true, sig)
			if err != nil {
				continue
			}
			if status != nil && status.Value != nil && len(status.Value) > 0 {
				if status.Value[0].Err != nil {
					return "", "", fmt.Errorf("交易失败: %v", status.Value[0].Err)
				}
				return programKeypair.PublicKey().String(), sig.String(), nil
			}
			time.Sleep(1 * time.Second)
		}
	}

	// 10. 写入程序数据
	// 获取最新的区块哈希
	recent, err = s.client.GetRecentBlockhash(ctx, rpc.CommitmentFinalized)
	if err != nil {
		return "", "", fmt.Errorf("获取最新区块哈希失败: %v", err)
	}

	// 创建写入程序数据的指令
	writeInstruction := solana.NewInstruction(
		solana.SystemProgramID,
		solana.AccountMetaSlice{
			solana.NewAccountMeta(programKeypair.PublicKey(), true, false),
		},
		programData,
	)

	// 创建交易
	tx, err = solana.NewTransaction(
		[]solana.Instruction{writeInstruction},
		recent.Value.Blockhash,
		solana.TransactionPayer(s.wallet.PublicKey()),
	)
	if err != nil {
		return "", "", fmt.Errorf("创建交易失败: %v", err)
	}

	// 签名交易
	_, err = tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(s.wallet.PublicKey()) {
			return s.wallet
		}
		return nil
	})
	if err != nil {
		return "", "", fmt.Errorf("签名交易失败: %v", err)
	}

	// 发送交易
	sig, err = s.client.SendTransaction(ctx, tx)
	if err != nil {
		return "", "", fmt.Errorf("发送交易失败: %v", err)
	}

	// 等待交易确认
	timeout = time.After(60 * time.Second)
	for {
		select {
		case <-ctx.Done():
			return "", "", fmt.Errorf("等待交易确认超时")
		case <-timeout:
			return "", "", fmt.Errorf("等待交易确认超时")
		default:
			status, err := s.client.GetSignatureStatuses(ctx, true, sig)
			if err != nil {
				continue
			}
			if status != nil && status.Value != nil && len(status.Value) > 0 {
				if status.Value[0].Err != nil {
					return "", "", fmt.Errorf("交易失败: %v", status.Value[0].Err)
				}
				return programKeypair.PublicKey().String(), sig.String(), nil
			}
			time.Sleep(1 * time.Second)
		}
	}
}
