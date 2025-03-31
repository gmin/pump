use anchor_lang::prelude::*;

use crate::state::mint::*;
use crate::errors::TokenError;

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
    require!(price > 0, TokenError::InvalidPrice);
    require!(max_amount > min_amount, TokenError::InvalidAmount);
    require!(end_time > start_time, TokenError::InvalidTime);
    require!(liquidity_percentage + staking_percentage <= 100, TokenError::InvalidPercentage);
    require!(
        ctx.accounts.authority.key() == ctx.accounts.token.admin,
        TokenError::Unauthorized
    );

    let mint_config = &mut ctx.accounts.mint_config;
    mint_config.token = ctx.accounts.token.key();
    mint_config.price = price;
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
        price: mint_config.price,
        max_amount: mint_config.max_amount,
        start_time: mint_config.start_time,
        end_time: mint_config.end_time,
    });

    msg!("Mint initialized");
    Ok(())
}

pub fn mint(ctx: Context<Mint>, amount: u64) -> Result<()> {
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

    // 计算支付金额和手续费
    let payment_amount = amount.checked_mul(mint_config.price).unwrap();
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