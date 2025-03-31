use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

use crate::state::staking::*;
use crate::errors::TokenError;

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

pub fn create_staking_pool(
    ctx: Context<CreateStakingPool>,
    duration: i64,
    reward_rate: u16,
) -> Result<()> {
    require!(duration > 0, TokenError::InvalidDuration);
    require!(reward_rate > 0 && reward_rate <= 10000, TokenError::InvalidRewardRate);
    require!(
        ctx.accounts.authority.key() == ctx.accounts.token.admin,
        TokenError::Unauthorized
    );

    let staking_pool = &mut ctx.accounts.staking_pool;
    staking_pool.token = ctx.accounts.token.key();
    staking_pool.duration = duration;
    staking_pool.reward_rate = reward_rate;
    staking_pool.total_staked = 0;
    staking_pool.total_rewards = 0;
    staking_pool.is_active = true;

    emit!(StakingPoolCreated {
        token: staking_pool.token,
        duration: staking_pool.duration,
        reward_rate: staking_pool.reward_rate,
    });

    msg!("Staking pool created");
    Ok(())
}

pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    require!(amount > 0, TokenError::InvalidAmount);
    require!(
        ctx.accounts.staking_pool.is_active,
        TokenError::StakingNotActive
    );

    // 转移代币到质押账户
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.staking_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount * 10u64.pow(ctx.accounts.token.decimals as u32),
    )?;

    // 创建质押记录
    let staking_position = &mut ctx.accounts.staking_position;
    staking_position.owner = ctx.accounts.user.key();
    staking_position.pool = ctx.accounts.staking_pool.key();
    staking_position.amount = amount;
    staking_position.start_time = Clock::get()?.unix_timestamp;
    staking_position.end_time = staking_position.start_time + ctx.accounts.staking_pool.duration;
    staking_position.is_claimed = false;

    // 更新质押池状态
    let staking_pool = &mut ctx.accounts.staking_pool;
    staking_pool.total_staked = staking_pool.total_staked.checked_add(amount).unwrap();

    emit!(TokenStaked {
        user: staking_position.owner,
        amount: staking_position.amount,
        end_time: staking_position.end_time,
    });

    msg!("Token staked: {}", amount);
    Ok(())
}

pub fn claim_stake(ctx: Context<ClaimStake>) -> Result<()> {
    let staking_position = &mut ctx.accounts.staking_position;
    let current_time = Clock::get()?.unix_timestamp;
    
    require!(
        current_time >= staking_position.end_time,
        TokenError::StakingPeriodNotEnded
    );
    require!(!staking_position.is_claimed, TokenError::AlreadyClaimed);

    // 计算收益
    let reward_amount = staking_position.amount
        .checked_mul(ctx.accounts.staking_pool.reward_rate as u64)
        .unwrap()
        .checked_div(10000)
        .unwrap();

    // 转移本金和收益
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.staking_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.token.to_account_info(),
            },
        ),
        (staking_position.amount + reward_amount) * 10u64.pow(ctx.accounts.token.decimals as u32),
    )?;

    // 更新状态
    staking_position.is_claimed = true;
    ctx.accounts.staking_pool.total_staked = ctx.accounts.staking_pool
        .total_staked
        .checked_sub(staking_position.amount)
        .unwrap();

    emit!(StakeClaimed {
        user: staking_position.owner,
        amount: staking_position.amount,
        reward: reward_amount,
    });

    msg!("Stake claimed");
    Ok(())
} 