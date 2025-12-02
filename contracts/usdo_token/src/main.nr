use dep::aztec::macros::aztec;

#[aztec]
contract USDOToken {
    use dep::aztec::{protocol_types::address::AztecAddress, state_vars::{Map, PublicMutable}};
    use dep::aztec::macros::{functions::{initializer, private, public, utility}, storage::storage};
    use dep::easy_private_state::EasyPrivateUint;

    #[storage]
    struct Storage<Context> {
        balances: Map<AztecAddress, EasyPrivateUint<Context>, Context>,
        public_balances: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        vault: PublicMutable<AztecAddress, Context>,
        owner: PublicMutable<AztecAddress, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(owner: AztecAddress) {
        storage.owner.write(owner);
    }

    #[public]
    fn set_vault(new_vault: AztecAddress) {
        let sender = context.msg_sender();
        assert(sender == storage.owner.read(), "Caller is not owner");
        storage.vault.write(new_vault);
    }

    #[public]
    fn mint_public(to: AztecAddress, amount: u128) {
        let sender = context.msg_sender();
        let vault = storage.vault.read();
        assert(sender == vault, "Caller is not vault");
        
        let current = storage.public_balances.at(to).read();
        storage.public_balances.at(to).write(current + amount);
    }

    #[public]
    fn burn_public(from: AztecAddress, amount: u128) {
        let sender = context.msg_sender();
        let vault = storage.vault.read();
        assert(sender == vault, "Caller is not vault");
        
        let current = storage.public_balances.at(from).read();
        storage.public_balances.at(from).write(current - amount);
    }

    #[private]
    fn mint_private(to: AztecAddress, amount: u128) {
        let sender = context.msg_sender();
        // let vault = storage.vault.read(); 
        // assert(sender == vault, "Caller is not vault");

        storage.balances.at(to).add(amount as u64, to); 
    }

    #[private]
    fn burn_private(from: AztecAddress, amount: u128) {
        let sender = context.msg_sender();
        // let vault = storage.vault.read();
        // assert(sender == vault, "Caller is not vault");

        storage.balances.at(from).sub(amount as u64, from);
    }

    #[private]
    fn transfer(amount: u128, recipient: AztecAddress) {
        let sender = context.msg_sender();
        storage.balances.at(sender).sub(amount as u64, sender);
        storage.balances.at(recipient).add(amount as u64, recipient);
    }

    #[utility]
    unconstrained fn get_balance(owner: AztecAddress) -> pub u128 {
        storage.balances.at(owner).get_value() as u128
    }

    #[utility]
    unconstrained fn get_public_balance(owner: AztecAddress) -> pub u128 {
        storage.public_balances.at(owner).read()
    }
}
