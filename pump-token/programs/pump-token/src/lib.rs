use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::Token;
use anchor_spl::metadata::Metadata;

declare_id!("9D9trvro19fWvkUL2vW7ShMDsExFNMX7Yc4upaSFECKz");

// 状态定义
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
        4 + // name length
        32 + // name
        4 + // symbol length
        8 + // symbol
        4 + // uri length
        200; // uri
}

#[account]
pub struct MintConfig {
    pub token: Pubkey,
    pub min_price: u64,      // 最低价格（lamports）
    pub max_price: u64,      // 最高价格（lamports）
    pub min_amount: u64,
    pub max_amount: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub liquidity_percentage: u8,
    pub staking_percentage: u8,
    pub is_initialized: bool,
    pub total_minted: u64,
    pub fee_rate: u8,
    pub is_active: bool,
}

impl MintConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // token
        8 + // min_price
        8 + // max_price
        8 + // min_amount
        8 + // max_amount
        8 + // start_time
        8 + // end_time
        1 + // liquidity_percentage
        1 + // staking_percentage
        1 + // is_initialized
        8 + // total_minted
        1 + // fee_rate
        1; // is_active
}

#[account]
pub struct MintRecord {
    pub mint_config: Pubkey,
    pub buyer: Pubkey,
    pub amount: u64,
    pub paid_amount: u64,
    pub fee_amount: u64,
    pub is_claimed: bool,
    pub created_at: i64,
    pub user: Pubkey,
    pub mint_time: i64,
}

impl MintRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // mint_config
        32 + // buyer
        8 + // amount
        8 + // paid_amount
        8 + // fee_amount
        1 + // is_claimed
        8 + // created_at
        32 + // user
        8; // mint_time
}

#[account]
pub struct LiquidityConfig {
    pub token: Pubkey,
    pub amm_program: Pubkey,
    pub pool_address: Pubkey,
    pub is_initialized: bool,
}

impl LiquidityConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // token
        32 + // amm_program
        32 + // pool_address
        1; // is_initialized
}

#[account]
pub struct LiquidityRecord {
    pub token: Pubkey,
    pub amount: u64,
    pub created_at: i64,
    pub is_destroyed: bool,
}

impl LiquidityRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // token
        8 + // amount
        8 + // created_at
        1; // is_destroyed
}

// 错误定义
#[error_code]
pub enum TokenError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Unauthorized")]
    Unauthorized,
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
}

// 账户结构体定义
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
    pub mint: Account<'info, token::Mint>,
    
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
    pub mint: Account<'info, token::Mint>,
    
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
    pub mint: Account<'info, token::Mint>,
    
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
pub struct Mint<'info> {
    #[account(mut)]
    pub mint_config: Account<'info, MintConfig>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + MintRecord::LEN,
        seeds = [b"mint_record", mint_config.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub mint_record: Account<'info, MintRecord>,
    
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimMint<'info> {
    #[account(mut)]
    pub mint_config: Account<'info, MintConfig>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    pub mint_record: Account<'info, MintRecord>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
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
    #[account(
        init,
        payer = authority,
        space = 8 + LiquidityRecord::LEN,
        seeds = [b"liquidity_record", token.key().as_ref()],
        bump
    )]
    pub liquidity_record: Account<'info, LiquidityRecord>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DestroyLiquidity<'info> {
    #[account(mut)]
    pub liquidity_record: Account<'info, LiquidityRecord>,
    
    #[account(mut)]
    pub token: Account<'info, BaseToken>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
}

// 事件定义
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
pub struct TokenMinted {
    pub user: Pubkey,
    pub amount: u64,
    pub paid_amount: u64,
    pub fee_amount: u64,
}

#[event]
pub struct TokenBurned {
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct LiquidityCreated {
    pub token: Pubkey,
    pub amount: u64,
}

#[event]
pub struct LiquidityDestroyed {
    pub token: Pubkey,
    pub amount: u64,
}

#[event]
pub struct MintInitialized {
    pub token: Pubkey,
    pub min_price: u64,
    pub max_price: u64,
    pub max_amount: u64,
    pub start_time: i64,
    pub end_time: i64,
}

#[event]
pub struct LiquidityInitialized {
    pub token: Pubkey,
    pub amm_program: Pubkey,
    pub pool_address: Pubkey,
}

// 指令实现
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
        require!(!ctx.accounts.token.is_initialized, TokenError::InvalidAmount);
        
        let token = &mut ctx.accounts.token;
        token.mint = ctx.accounts.mint.key();
        token.authority = ctx.accounts.authority.key();
        token.admin = ctx.accounts.authority.key();
        token.treasury = ctx.accounts.authority.key();
        token.decimals = decimals;
        token.total_supply = 0;
        token.is_initialized = true;
        token.is_paused = false;
        token.created_at = Clock::get()?.unix_timestamp;
        token.name = name;
        token.symbol = symbol;
        token.uri = uri;

        emit!(TokenInitialized {
            mint: token.mint,
            authority: token.authority,
            decimals: token.decimals,
            name: token.name.clone(),
            symbol: token.symbol.clone(),
            uri: token.uri.clone(),
        });

        msg!("Token initialized");
        Ok(())
    }

    pub fn update_token_metadata(
        ctx: Context<UpdateTokenMetadata>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        let token = &mut ctx.accounts.token;
        token.name = name.clone();
        token.symbol = symbol.clone();
        token.uri = uri.clone();

        emit!(TokenMetadataUpdated {
            mint: token.mint,
            name,
            symbol,
            uri,
        });

        msg!("Token metadata updated");
        Ok(())
    }

    pub fn update_admin(ctx: Context<UpdateAdmin>, new_admin: Pubkey) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        let token = &mut ctx.accounts.token;
        let old_admin = token.admin;
        token.admin = new_admin;

        emit!(AdminUpdated {
            mint: token.mint,
            old_admin,
            new_admin,
        });

        msg!("Admin updated");
        Ok(())
    }

    pub fn update_treasury(ctx: Context<UpdateTreasury>, new_treasury: Pubkey) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        let token = &mut ctx.accounts.token;
        let old_treasury = token.treasury;
        token.treasury = new_treasury;

        emit!(TreasuryUpdated {
            mint: token.mint,
            old_treasury,
            new_treasury,
        });

        msg!("Treasury updated");
        Ok(())
    }

    pub fn pause_token(ctx: Context<PauseToken>) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        let token = &mut ctx.accounts.token;
        token.is_paused = true;

        msg!("Token paused");
        Ok(())
    }

    pub fn unpause_token(ctx: Context<UnpauseToken>) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        let token = &mut ctx.accounts.token;
        token.is_paused = false;

        msg!("Token unpaused");
        Ok(())
    }

    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.token.is_paused, TokenError::InvalidAmount);
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        let token = &mut ctx.accounts.token;
        token.total_supply = token.total_supply.checked_add(amount).unwrap();

        emit!(TokenMinted {
            user: ctx.accounts.authority.key(),
            amount,
            paid_amount: 0,
            fee_amount: 0,
        });

        msg!("Token minted: {}", amount);
        Ok(())
    }

    pub fn burn_token(ctx: Context<BurnToken>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.token.is_paused, TokenError::InvalidAmount);
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        let token = &mut ctx.accounts.token;
        token.total_supply = token.total_supply.checked_sub(amount).unwrap();

        emit!(TokenBurned {
            user: ctx.accounts.authority.key(),
            amount,
        });

        msg!("Token burned: {}", amount);
        Ok(())
    }

    // Mint模块指令
    pub fn initialize_mint(
        ctx: Context<InitializeMint>,
        min_price: u64,
        max_price: u64,
        min_amount: u64,
        max_amount: u64,
        start_time: i64,
        end_time: i64,
        liquidity_percentage: u8,
        staking_percentage: u8,
    ) -> Result<()> {
        require!(min_price > 0, TokenError::InvalidPrice);
        require!(max_price >= min_price, TokenError::InvalidPrice);
        require!(max_amount > min_amount, TokenError::InvalidAmount);
        require!(end_time > start_time, TokenError::InvalidTime);
        require!(liquidity_percentage + staking_percentage <= 100, TokenError::InvalidPercentage);
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        let mint_config = &mut ctx.accounts.mint_config;
        mint_config.token = ctx.accounts.token.key();
        mint_config.min_price = min_price;
        mint_config.max_price = max_price;
        mint_config.max_amount = max_amount;
        mint_config.min_amount = min_amount;
        mint_config.start_time = start_time;
        mint_config.end_time = end_time;
        mint_config.total_minted = 0;
        mint_config.liquidity_percentage = liquidity_percentage;
        mint_config.staking_percentage = staking_percentage;
        mint_config.fee_rate = 100; // 1%
        mint_config.is_active = true;

        emit!(MintInitialized {
            token: mint_config.token,
            min_price: mint_config.min_price,
            max_price: mint_config.max_price,
            max_amount: mint_config.max_amount,
            start_time: mint_config.start_time,
            end_time: mint_config.end_time,
        });

        msg!("Mint initialized");
        Ok(())
    }

    pub fn mint(ctx: Context<Mint>, amount: u64, price: u64) -> Result<()> {
        let mint_config = &mut ctx.accounts.mint_config;
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(mint_config.is_active, TokenError::MintNotActive);
        require!(current_time >= mint_config.start_time, TokenError::MintNotStarted);
        require!(current_time <= mint_config.end_time, TokenError::MintEnded);
        require!(amount >= mint_config.min_amount, TokenError::AmountTooSmall);
        require!(amount <= mint_config.max_amount, TokenError::AmountTooLarge);
        require!(
            mint_config.total_minted + amount <= mint_config.max_amount,
            TokenError::ExceedMaxAmount
        );
        require!(price >= mint_config.min_price, TokenError::InvalidPrice);
        require!(price <= mint_config.max_price, TokenError::InvalidPrice);

        // 计算支付金额和手续费
        let payment_amount = amount.checked_mul(price).unwrap();
        let fee_amount = payment_amount.checked_mul(mint_config.fee_rate as u64).unwrap().checked_div(10000).unwrap();
        let final_payment = payment_amount.checked_sub(fee_amount).unwrap();

        // 转移SOL
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            final_payment,
        )?;

        // 更新状态
        mint_config.total_minted = mint_config.total_minted.checked_add(amount).unwrap();

        // 创建mint记录
        let mint_record = &mut ctx.accounts.mint_record;
        mint_record.user = ctx.accounts.buyer.key();
        mint_record.amount = amount;
        mint_record.paid_amount = payment_amount;
        mint_record.fee_amount = fee_amount;
        mint_record.mint_time = current_time;
        mint_record.is_claimed = false;

        emit!(TokenMinted {
            user: mint_record.user,
            amount: mint_record.amount,
            paid_amount: mint_record.paid_amount,
            fee_amount: mint_record.fee_amount,
        });

        msg!("Token minted: {}", amount);
        Ok(())
    }

    pub fn claim_mint(ctx: Context<ClaimMint>) -> Result<()> {
        let mint_record = &mut ctx.accounts.mint_record;
        require!(!mint_record.is_claimed, TokenError::InvalidAmount);

        // 标记为已领取
        mint_record.is_claimed = true;

        msg!("Mint claimed");
        Ok(())
    }

    // 流动性模块指令
    pub fn initialize_liquidity(
        ctx: Context<InitializeLiquidity>,
        amm_program: Pubkey,
        pool_address: Pubkey,
    ) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        let liquidity_config = &mut ctx.accounts.liquidity_config;
        liquidity_config.token = ctx.accounts.token.key();
        liquidity_config.amm_program = amm_program;
        liquidity_config.pool_address = pool_address;
        liquidity_config.is_initialized = true;

        emit!(LiquidityInitialized {
            token: liquidity_config.token,
            amm_program: liquidity_config.amm_program,
            pool_address: liquidity_config.pool_address,
        });

        msg!("Liquidity initialized");
        Ok(())
    }

    pub fn create_liquidity(ctx: Context<CreateLiquidity>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        // 计算手续费
        let fee_amount = 6_000_000_000; // 6 SOL

        // 转移手续费
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            fee_amount,
        )?;

        // 创建流动性记录
        let liquidity_record = &mut ctx.accounts.liquidity_record;
        liquidity_record.token = ctx.accounts.token.key();
        liquidity_record.amount = amount;
        liquidity_record.created_at = Clock::get()?.unix_timestamp;
        liquidity_record.is_destroyed = false;

        emit!(LiquidityCreated {
            token: liquidity_record.token,
            amount: liquidity_record.amount,
        });

        msg!("Liquidity created: {}", amount);
        Ok(())
    }

    pub fn destroy_liquidity(ctx: Context<DestroyLiquidity>) -> Result<()> {
        let liquidity_record = &mut ctx.accounts.liquidity_record;
        require!(!liquidity_record.is_destroyed, TokenError::InvalidAmount);
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token.admin,
            TokenError::Unauthorized
        );

        // 标记为已销毁
        liquidity_record.is_destroyed = true;

        emit!(LiquidityDestroyed {
            token: liquidity_record.token,
            amount: liquidity_record.amount,
        });

        msg!("Liquidity destroyed");
        Ok(())
    }
}
