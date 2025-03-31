use anchor_lang::prelude::*;

#[account]
pub struct StakingPool {
    pub token: Pubkey,
    pub duration: i64,
    pub reward_rate: u16,
    pub total_staked: u64,
    pub total_rewards: u64,
    pub is_active: bool,
}

impl StakingPool {
    pub const LEN: usize = 8 + // discriminator
        32 + // token
        8 + // duration
        2 + // reward_rate
        8 + // total_staked
        8 + // total_rewards
        1; // is_active
}

#[account]
pub struct StakingPosition {
    pub owner: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub is_claimed: bool,
}

impl StakingPosition {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        32 + // pool
        8 + // amount
        8 + // start_time
        8 + // end_time
        1; // is_claimed
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