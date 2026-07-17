#![no_std]

//! Live Poll Contract
//!
//! A single-question, multi-option poll where each address can vote exactly
//! once. Emits a `vote` event on every successful vote so a frontend can
//! subscribe and update results in real time, and exposes `get_results` for
//! direct reads / polling.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Map, String,
    Symbol, Vec,
};

const VOTE_EVENT: Symbol = symbol_short!("vote");

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Question,
    Options,
    Votes,
    Voters,
    Initialized,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PollError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    AlreadyVoted = 3,
    InvalidOption = 4,
    EmptyOptions = 5,
}

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    /// One-time setup: sets the question, the list of options, and the
    /// admin address. Can only be called once.
    pub fn initialize(
        env: Env,
        admin: Address,
        question: String,
        options: Vec<String>,
    ) -> Result<(), PollError> {
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(PollError::AlreadyInitialized);
        }
        if options.len() == 0 {
            return Err(PollError::EmptyOptions);
        }

        admin.require_auth();

        let mut votes: Map<u32, u32> = Map::new(&env);
        for i in 0..options.len() {
            votes.set(i, 0);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Question, &question);
        env.storage().instance().set(&DataKey::Options, &options);
        env.storage().instance().set(&DataKey::Votes, &votes);
        env.storage()
            .instance()
            .set(&DataKey::Voters, &Map::<Address, bool>::new(&env));
        env.storage().instance().set(&DataKey::Initialized, &true);

        // extend the contract's storage TTL so the poll survives long enough
        env.storage().instance().extend_ttl(500_000, 500_000);

        Ok(())
    }

    /// Cast a vote for `option_index`. Requires the voter's signature.
    /// Fails if the poll isn't initialized, the option is out of range, or
    /// the voter has already voted.
    pub fn vote(env: Env, voter: Address, option_index: u32) -> Result<(), PollError> {
        voter.require_auth();

        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(PollError::NotInitialized);
        }

        let options: Vec<String> = env.storage().instance().get(&DataKey::Options).unwrap();
        if option_index >= options.len() {
            return Err(PollError::InvalidOption);
        }

        let mut voters: Map<Address, bool> =
            env.storage().instance().get(&DataKey::Voters).unwrap();
        if voters.contains_key(voter.clone()) {
            return Err(PollError::AlreadyVoted);
        }
        voters.set(voter.clone(), true);
        env.storage().instance().set(&DataKey::Voters, &voters);

        let mut votes: Map<u32, u32> = env.storage().instance().get(&DataKey::Votes).unwrap();
        let current = votes.get(option_index).unwrap_or(0);
        votes.set(option_index, current + 1);
        env.storage().instance().set(&DataKey::Votes, &votes);

        // Real-time signal for the frontend event listener.
        env.events().publish((VOTE_EVENT, voter), option_index);

        env.storage().instance().extend_ttl(500_000, 500_000);

        Ok(())
    }

    pub fn get_question(env: Env) -> String {
        env.storage().instance().get(&DataKey::Question).unwrap()
    }

    pub fn get_options(env: Env) -> Vec<String> {
        env.storage().instance().get(&DataKey::Options).unwrap()
    }

    /// Returns option_index -> vote_count for all options.
    pub fn get_results(env: Env) -> Map<u32, u32> {
        env.storage().instance().get(&DataKey::Votes).unwrap()
    }

    pub fn has_voted(env: Env, voter: Address) -> bool {
        let voters: Map<Address, bool> = env.storage().instance().get(&DataKey::Voters).unwrap();
        voters.contains_key(voter)
    }
}

mod test;
