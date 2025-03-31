use anchor_lang::prelude::*;

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