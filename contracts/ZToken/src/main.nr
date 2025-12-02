use dep::aztec::macros::aztec;

#[aztec]
contract ZToken {
    use dep::aztec::{protocol_types::address::AztecAddress, state_vars::{Map, PublicMutable}};
    use dep::aztec::macros::functions::{initializer, public, utility};
    use dep::aztec::macros::storage::storage;

    #[storage]
    struct Storage<Context> {
        total_supply: PublicMutable<u64, Context>,
        balances: Map<AztecAddress, PublicMutable<u64, Context>, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(initial_supply: u64, owner: AztecAddress) {
        storage.total_supply.write(initial_supply);
        storage.balances.at(owner).write(initial_supply);
    }

    #[public]
    fn mint(amount: u64, owner: AztecAddress) {
        let current_supply = storage.total_supply.read();
        let current_balance = storage.balances.at(owner).read();
        
        storage.total_supply.write(current_supply + amount);
        storage.balances.at(owner).write(current_balance + amount);
    }

    #[public]
    fn transfer(amount: u64, recipient: AztecAddress) {
        let sender = context.msg_sender();
        let sender_balance = storage.balances.at(sender).read();
        let recipient_balance = storage.balances.at(recipient).read();

        storage.balances.at(sender).write(sender_balance - amount);
        storage.balances.at(recipient).write(recipient_balance + amount);
    }

    #[utility]
    unconstrained fn get_balance(owner: AztecAddress) -> pub u64 {
        storage.balances.at(owner).read()
    }
}
