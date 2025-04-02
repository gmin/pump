package errors

import "errors"

var (
	// ErrMintPeriodNotActive 表示当前不在 Mint 期间
	ErrMintPeriodNotActive = errors.New("mint period is not active")

	// ErrExceededMintLimit 表示超出 Mint 限制
	ErrExceededMintLimit = errors.New("exceeded mint limit")
)
