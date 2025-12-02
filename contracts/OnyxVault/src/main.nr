use dep::aztec::macros::aztec;

#[aztec]
contract OnyxVault {
    use dep::aztec::macros::{functions::{initializer, public}, storage::storage};
    use dep::aztec::{protocol_types::address::AztecAddress, state_vars::{Map, PublicMutable, PublicImmutable}};
    use dep::aztec::protocol_types::traits::{Serialize, Deserialize, Packable};

    #[derive(Serialize, Deserialize, Packable)]
    struct Vault {
        collateral: Field,
        debt: Field,
    }

    #[storage]
    struct Storage<Context> {
        vaults: Map<AztecAddress, PublicMutable<Vault, Context>, Context>,
        stability_pool: PublicImmutable<AztecAddress, Context>,
        oracle: PublicImmutable<AztecAddress, Context>,
        usdo_token: PublicImmutable<AztecAddress, Context>,
        collateral_token: PublicImmutable<AztecAddress, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(
        stability_pool: AztecAddress,
        oracle: AztecAddress,
        usdo_token: AztecAddress,
        collateral_token: AztecAddress
    ) {
        storage.stability_pool.initialize(stability_pool);
        storage.oracle.initialize(oracle);
        storage.usdo_token.initialize(usdo_token);
        storage.collateral_token.initialize(collateral_token);
    }

    #[public]
    fn deposit(amount: Field) {
        let sender = context.msg_sender();
        let mut vault = storage.vaults.at(sender).read();
        vault.collateral = vault.collateral + amount;
        storage.vaults.at(sender).write(vault);
    }

    #[public]
    fn borrow(amount: Field) {
        let sender = context.msg_sender();
        let vault = storage.vaults.at(sender).read();
        
        let price = 50; 
        
        // Cast to u128 for comparison
        let collateral_value = (vault.collateral as u128) * (price as u128);
        let required_collateral = ((amount as u128) * 150) / 100;
        
        assert(collateral_value > required_collateral, "Insufficient collateral");
        
        let mut new_vault = vault;
        new_vault.debt = vault.debt + amount;
        storage.vaults.at(sender).write(new_vault);
    }

    #[public]
    fn repay(amount: Field) {
        let sender = context.msg_sender();
        let vault = storage.vaults.at(sender).read();
        
        // Calculate interest = amount * 0.05
        // Cast to u128 for math safety (though Field math is fine for equality, division is tricky)
        // But here we just do simple arithmetic. Field arithmetic is fine if no overflow/underflow relative to modulus.
        // But for "amount * 5 / 100", integer division is expected. Field division is modular inverse.
        // So we MUST use u128 for integer division logic.
        let amount_u128 = amount as u128;
        let interest = (amount_u128 * 5) / 100;
        // let total_repay = amount_u128 + interest;
        
        // Update debt
        let mut new_vault = vault;
        let debt_u128 = vault.debt as u128;
        assert(debt_u128 >= amount_u128, "Overpayment");
        
        new_vault.debt = (debt_u128 - amount_u128) as Field;
        storage.vaults.at(sender).write(new_vault);
    }
}
