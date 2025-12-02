use dep::aztec::macros::aztec;

#[aztec]
contract PriceOracle {
    use dep::aztec::macros::{functions::{initializer, public, utility}, storage::storage};
    use dep::aztec::{protocol_types::address::AztecAddress, state_vars::PublicMutable};

    #[storage]
    struct Storage<Context> {
        owner: PublicMutable<AztecAddress, Context>,
        zec_price: PublicMutable<u128, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(initial_price: u128, owner: AztecAddress) {
        storage.owner.write(owner);
        storage.zec_price.write(initial_price);
    }

    #[public]
    fn set_price(new_price: u128) {
        let sender = context.msg_sender();
        assert(sender == storage.owner.read(), "Caller is not owner");
        storage.zec_price.write(new_price);
    }

    #[utility]
    unconstrained fn get_price() -> pub u128 {
        storage.zec_price.read()
    }

    #[public]
    fn get_price_public() -> u128 {
        storage.zec_price.read()
    }
}
