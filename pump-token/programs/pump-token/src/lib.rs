use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::metadata::{self, Metadata};
use anchor_spl::associated_token::AssociatedToken;

// 导入模块
mod modules;
mod state;
mod errors;

use modules::*;
use state::*;
use errors::*;

declare_id!("8TJSHwHPT3syXtT6E3xz6j92qgSAUVWiKeQiSFQjzbka");

#[program]
pub mod pump_token {
    use super::*;

    // 基础代币模块指令
    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        decimals: u8,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        base_token::initialize_token(ctx, decimals, name, symbol, uri)
    }

    pub fn update_token_metadata(
        ctx: Context<UpdateTokenMetadata>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        base_token::update_token_metadata(ctx, name, symbol, uri)
    }

    pub fn update_admin(ctx: Context<UpdateAdmin>, new_admin: Pubkey) -> Result<()> {
        base_token::update_admin(ctx, new_admin)
    }

    pub fn update_treasury(ctx: Context<UpdateTreasury>, new_treasury: Pubkey) -> Result<()> {
        base_token::update_treasury(ctx, new_treasury)
    }

    pub fn pause_token(ctx: Context<PauseToken>) -> Result<()> {
        base_token::pause_token(ctx)
    }

    pub fn unpause_token(ctx: Context<UnpauseToken>) -> Result<()> {
        base_token::unpause_token(ctx)
    }

    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        base_token::mint_token(ctx, amount)
    }

    pub fn burn_token(ctx: Context<BurnToken>, amount: u64) -> Result<()> {
        base_token::burn_token(ctx, amount)
    }

    // Mint模块指令
    pub fn initialize_mint(
        ctx: Context<InitializeMint>,
        price: u64,
        max_amount: u64,
        min_amount: u64,
        start_time: i64,
        end_time: i64,
        liquidity_percentage: u8,
        staking_percentage: u8,
    ) -> Result<()> {
        mint::initialize_mint(
            ctx,
            price,
            max_amount,
            min_amount,
            start_time,
            end_time,
            liquidity_percentage,
            staking_percentage,
        )
    }

    pub fn mint(ctx: Context<Mint>, amount: u64) -> Result<()> {
        mint::mint(ctx, amount)
    }

    // 流动性模块指令
    pub fn initialize_liquidity(
        ctx: Context<InitializeLiquidity>,
        amm_program: Pubkey,
        pool_address: Pubkey,
    ) -> Result<()> {
        liquidity::initialize_liquidity(ctx, amm_program, pool_address)
    }

    pub fn create_liquidity(ctx: Context<CreateLiquidity>, amount: u64) -> Result<()> {
        liquidity::create_liquidity(ctx, amount)
    }

    // 质押挖矿模块指令
    pub fn create_staking_pool(
        ctx: Context<CreateStakingPool>,
        duration: i64,
        reward_rate: u16,
    ) -> Result<()> {
        staking::create_staking_pool(ctx, duration, reward_rate)
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        staking::stake(ctx, amount)
    }

    pub fn claim_stake(ctx: Context<ClaimStake>) -> Result<()> {
        staking::claim_stake(ctx)
    }
}

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + BaseToken::LEN,
        seeds = [b"token", mint.key().as_ref()],
        bump
    )]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: 元数据账户
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateTokenMetadata<'info> {
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: 元数据账户
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    pub metadata_program: Program<'info, Metadata>,
}

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateTreasury<'info> {
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct PauseToken<'info> {
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UnpauseToken<'info> {
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnToken<'info> {
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + MintConfig::LEN,
        seeds = [b"mint_config", token.key().as_ref()],
        bump
    )]
    pub mint_config: Account<'info, MintConfig>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeLiquidity<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + LiquidityConfig::LEN,
        seeds = [b"liquidity_config", token.key().as_ref()],
        bump
    )]
    pub liquidity_config: Account<'info, LiquidityConfig>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateLiquidity<'info> {
    #[account(mut)]
    pub liquidity_config: Account<'info, LiquidityConfig>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + LiquidityRecord::LEN,
        seeds = [b"liquidity_record", token.key().as_ref()],
        bump
    )]
    pub liquidity_record: Account<'info, LiquidityRecord>,
    
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateStakingPool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + StakingPool::LEN,
        seeds = [b"staking_pool", token.key().as_ref()],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + StakingPosition::LEN,
        seeds = [b"staking_position", staking_pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub staking_position: Account<'info, StakingPosition>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub staking_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimStake<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub staking_position: Account<'info, StakingPosition>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub staking_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct BaseToken {
    pub mint: Pubkey,
    pub authority: Pubkey,
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub decimals: u8,
    pub total_supply: u64,
    pub is_initialized: bool,
    pub is_paused: bool,
    pub created_at: i64,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

impl BaseToken {
    pub const LEN: usize = 8 + // discriminator
        32 + // mint
        32 + // authority
        32 + // admin
        32 + // treasury
        1 + // decimals
        8 + // total_supply
        1 + // is_initialized
        1 + // is_paused
        8 + // created_at
        4 + 32 + // name (String)
        4 + 10 + // symbol (String)
        4 + 200; // uri (String)
}

#[event]
pub struct TokenInitialized {
    pub mint: Pubkey,
    pub authority: Pubkey,
    pub decimals: u8,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

#[event]
pub struct TokenMetadataUpdated {
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

#[event]
pub struct AdminUpdated {
    pub mint: Pubkey,
    pub old_admin: Pubkey,
    pub new_admin: Pubkey,
}

#[event]
pub struct TreasuryUpdated {
    pub mint: Pubkey,
    pub old_treasury: Pubkey,
    pub new_treasury: Pubkey,
}

#[event]
pub struct MintInitialized {
    pub token: Pubkey,
    pub price: u64,
    pub max_amount: u64,
    pub start_time: i64,
    pub end_time: i64,
}

#[event]
pub struct TokenMinted {
    pub user: Pubkey,
    pub amount: u64,
    pub paid_amount: u64,
    pub fee_amount: u64,
}

#[event]
pub struct LiquidityInitialized {
    pub token: Pubkey,
    pub amm_program: Pubkey,
    pub pool_address: Pubkey,
}

#[event]
pub struct LiquidityCreated {
    pub token: Pubkey,
    pub amount: u64,
}

#[event]
pub struct StakingPoolCreated {
    pub token: Pubkey,
    pub duration: i64,
    pub reward_rate: u16,
}

#[event]
pub struct TokenStaked {
    pub user: Pubkey,
    pub amount: u64,
    pub end_time: i64,
}

#[event]
pub struct StakeClaimed {
    pub user: Pubkey,
    pub amount: u64,
    pub reward: u64,
}

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
    
    #[msg("Invalid reward rate")]
    InvalidRewardRate,
    
    #[msg("Staking not active")]
    StakingNotActive,
    
    #[msg("Staking period not ended")]
    StakingPeriodNotEnded,
    
    #[msg("Already claimed")]
    AlreadyClaimed,
}
