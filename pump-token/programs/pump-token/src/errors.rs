use anchor_lang::prelude::*;

#[error_code]
pub enum TokenError {
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("Insufficient funds")]
    InsufficientFunds,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Already initialized")]
    AlreadyInitialized,
    
    #[msg("Not initialized")]
    NotInitialized,
    
    #[msg("Invalid decimals")]
    InvalidDecimals,

    #[msg("Token is paused")]
    TokenPaused,

    #[msg("Token is already paused")]
    AlreadyPaused,

    #[msg("Token is not paused")]
    NotPaused,

    #[msg("Name too long")]
    NameTooLong,

    #[msg("Symbol too long")]
    SymbolTooLong,

    #[msg("Invalid price")]
    InvalidPrice,
    
    #[msg("Invalid time")]
    InvalidTime,
    
    #[msg("Invalid percentage")]
    InvalidPercentage,
    
    #[msg("Mint not active")]
    MintNotActive,
    
    #[msg("Mint not started")]
    MintNotStarted,
    
    #[msg("Mint ended")]
    MintEnded,
    
    #[msg("Amount too small")]
    AmountTooSmall,
    
    #[msg("Amount too large")]
    AmountTooLarge,
    
    #[msg("Exceed max amount")]
    ExceedMaxAmount,
    
    #[msg("Invalid duration")]
    InvalidDuration,
    
    #[msg("Already claimed")]
    AlreadyClaimed,

    #[msg("Not claimed yet")]
    NotClaimedYet,

    #[msg("Liquidity not active")]
    LiquidityNotActive,

    #[msg("Liquidity already exists")]
    LiquidityAlreadyExists,

    #[msg("Liquidity not exists")]
    LiquidityNotExists,
} 