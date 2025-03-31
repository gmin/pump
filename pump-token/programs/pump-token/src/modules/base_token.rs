use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::metadata::{self, Metadata};

use crate::state::base_token::*;
use crate::errors::TokenError;

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

pub fn initialize_token(
    ctx: Context<InitializeToken>,
    decimals: u8,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    require!(decimals <= 9, TokenError::InvalidDecimals);
    require!(name.len() <= 32, TokenError::NameTooLong);
    require!(symbol.len() <= 10, TokenError::SymbolTooLong);
    
    let token = &mut ctx.accounts.token;
    token.mint = ctx.accounts.mint.key();
    token.authority = ctx.accounts.authority.key();
    token.decimals = decimals;
    token.total_supply = 0;
    token.is_initialized = true;
    token.is_paused = false;
    token.created_at = Clock::get()?.unix_timestamp;
    token.name = name;
    token.symbol = symbol;
    token.uri = uri;
    token.admin = ctx.accounts.authority.key();
    token.treasury = ctx.accounts.authority.key();

    // 创建元数据
    metadata::create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.metadata_program.to_account_info(),
            metadata::CreateMetadataAccountV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.authority.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                update_authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        name,
        symbol,
        uri,
        Some(ctx.accounts.authority.key()),
        0,
        true,
        true,
        None,
        None,
        None,
    )?;

    emit!(TokenInitialized {
        mint: token.mint,
        authority: token.authority,
        decimals: token.decimals,
        name: token.name.clone(),
        symbol: token.symbol.clone(),
        uri: token.uri.clone(),
    });

    msg!("Token initialized: {}", token.name);
    Ok(())
}

pub fn update_token_metadata(
    ctx: Context<UpdateTokenMetadata>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    require!(name.len() <= 32, TokenError::NameTooLong);
    require!(symbol.len() <= 10, TokenError::SymbolTooLong);
    require!(
        ctx.accounts.authority.key() == ctx.accounts.token.admin,
        TokenError::Unauthorized
    );

    let token = &mut ctx.accounts.token;
    token.name = name.clone();
    token.symbol = symbol.clone();
    token.uri = uri.clone();

    // 更新链上元数据
    metadata::update_metadata_accounts_v2(
        CpiContext::new(
            ctx.accounts.metadata_program.to_account_info(),
            metadata::UpdateMetadataAccountV2 {
                metadata: ctx.accounts.metadata.to_account_info(),
                update_authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        Some(name),
        Some(symbol),
        Some(uri),
        None,
        0,
        true,
        true,
        None,
        None,
        None,
    )?;

    emit!(TokenMetadataUpdated {
        mint: token.mint,
        name: token.name.clone(),
        symbol: token.symbol.clone(),
        uri: token.uri.clone(),
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
    token.admin = new_admin;

    emit!(AdminUpdated {
        mint: token.mint,
        old_admin: ctx.accounts.authority.key(),
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
    token.treasury = new_treasury;

    emit!(TreasuryUpdated {
        mint: token.mint,
        old_treasury: token.treasury,
        new_treasury,
    });

    msg!("Treasury updated");
    Ok(())
}

pub fn pause_token(ctx: Context<PauseToken>) -> Result<()> {
    let token = &mut ctx.accounts.token;
    require!(!token.is_paused, TokenError::AlreadyPaused);
    require!(ctx.accounts.authority.key() == token.authority, TokenError::Unauthorized);
    
    token.is_paused = true;
    msg!("Token paused");
    Ok(())
}

pub fn unpause_token(ctx: Context<UnpauseToken>) -> Result<()> {
    let token = &mut ctx.accounts.token;
    require!(token.is_paused, TokenError::NotPaused);
    require!(ctx.accounts.authority.key() == token.authority, TokenError::Unauthorized);
    
    token.is_paused = false;
    msg!("Token unpaused");
    Ok(())
}

pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
    require!(amount > 0, TokenError::InvalidAmount);
    require!(!ctx.accounts.token.is_paused, TokenError::TokenPaused);
    require!(ctx.accounts.authority.key() == ctx.accounts.token.authority, TokenError::Unauthorized);

    let token = &mut ctx.accounts.token;
    token.total_supply = token.total_supply.checked_add(amount).unwrap();

    token::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount * 10u64.pow(token.decimals as u32),
    )?;

    msg!("Token minted: {}", amount);
    Ok(())
}

pub fn burn_token(ctx: Context<BurnToken>, amount: u64) -> Result<()> {
    require!(amount > 0, TokenError::InvalidAmount);
    require!(!ctx.accounts.token.is_paused, TokenError::TokenPaused);
    require!(ctx.accounts.authority.key() == ctx.accounts.token.authority, TokenError::Unauthorized);

    let token = &mut ctx.accounts.token;
    token.total_supply = token.total_supply.checked_sub(amount).unwrap();

    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount * 10u64.pow(token.decimals as u32),
    )?;

    msg!("Token burned: {}", amount);
    Ok(())
} 