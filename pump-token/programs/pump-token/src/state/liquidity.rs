use anchor_lang::prelude::*;

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