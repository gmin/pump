use anchor_lang::prelude::*;

use crate::state::liquidity::*;
use crate::errors::TokenError;

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