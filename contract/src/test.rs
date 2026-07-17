#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{vec, Env};

#[test]
fn test_full_poll_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PollContract);
    let client = PollContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);

    let question = String::from_str(&env, "Best Stellar wallet?");
    let options = vec![
        &env,
        String::from_str(&env, "Freighter"),
        String::from_str(&env, "xBull"),
        String::from_str(&env, "Lobstr"),
    ];

    client.initialize(&admin, &question, &options);

    assert_eq!(client.get_question(), question);
    assert_eq!(client.get_options().len(), 3);

    client.vote(&voter1, &0u32);
    client.vote(&voter2, &0u32);

    let results = client.get_results();
    assert_eq!(results.get(0).unwrap(), 2);
    assert_eq!(results.get(1).unwrap(), 0);

    assert!(client.has_voted(&voter1));
}

#[test]
fn test_double_vote_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PollContract);
    let client = PollContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let voter = Address::generate(&env);
    let options = vec![&env, String::from_str(&env, "A"), String::from_str(&env, "B")];
    client.initialize(&admin, &String::from_str(&env, "Q?"), &options);

    client.vote(&voter, &0u32);
    let result = client.try_vote(&voter, &0u32);
    assert_eq!(result, Err(Ok(PollError::AlreadyVoted)));
}

#[test]
fn test_invalid_option_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PollContract);
    let client = PollContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let voter = Address::generate(&env);
    let options = vec![&env, String::from_str(&env, "A"), String::from_str(&env, "B")];
    client.initialize(&admin, &String::from_str(&env, "Q?"), &options);

    let result = client.try_vote(&voter, &99u32);
    assert_eq!(result, Err(Ok(PollError::InvalidOption)));
}
