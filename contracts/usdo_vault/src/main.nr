use dep::aztec::macros::aztec;

mod types;

#[aztec]
contract UsdoVault {
    use dep::aztec::macros::{functions::{initializer, public, private}, storage::storage};
    use dep::aztec::{protocol_types::address::AztecAddress, state_vars::{Map, PublicMutable}};
    use dep::aztec::protocol_types::abis::function_selector::FunctionSelector;
    use dep::aztec::context::gas::GasOpts;
    use dep::aztec::protocol_types::traits::ToField;
    use crate::types::{get_precision, exp_decay, max, min};

    #[storage]
    struct Storage<Context> {
        // Config
        owner: PublicMutable<AztecAddress, Context>,
        floor_price_pf: PublicMutable<u128, Context>,
        alpha_high_buffer: PublicMutable<u128, Context>,
        beta_bonus: PublicMutable<u128, Context>,
        gamma_fee: PublicMutable<u128, Context>,
        delta_discount: PublicMutable<u128, Context>,
        kappa_emergency: PublicMutable<u128, Context>,
        
        phi_participation: PublicMutable<u128, Context>,
        lambda_decay: PublicMutable<u128, Context>,
        psi_floor_protection: PublicMutable<u128, Context>,
        
        // Addresses
        zec_oracle: PublicMutable<AztecAddress, Context>,
        usdo_token: PublicMutable<AztecAddress, Context>,
        xusdo_token: PublicMutable<AztecAddress, Context>,
        zec_token: PublicMutable<AztecAddress, Context>, // ZEC_WRAPPED
        
        emergency_mode: PublicMutable<bool, Context>,
        
        // Global Accounting
        total_reserve_zec: PublicMutable<u128, Context>,
        total_usdo_supply: PublicMutable<u128, Context>,
        total_xusdo_supply: PublicMutable<u128, Context>,
        vap_balance_usd: PublicMutable<u128, Context>,
        
        // User Positions (Simplified as public map for demo, ideally private notes)
        // Mapping from (User + Index) hash to Position data is hard in simple storage.
        // We'll use a simplified mapping for "last mint timestamp" to simulate age for now, 
        // or just accept that we can't fully implement the list of positions without custom notes.
        // Let's implement the math assuming we have the timestamp.
        // We'll store a "mint_timestamp" for the user's last action for simplicity in this iteration.
        last_mint_timestamp: Map<AztecAddress, PublicMutable<u64, Context>, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(
        owner: AztecAddress,
        zec_oracle: AztecAddress,
        usdo_token: AztecAddress,
        xusdo_token: AztecAddress,
        zec_token: AztecAddress
    ) {
        storage.owner.write(owner);
        storage.zec_oracle.write(zec_oracle);
        storage.usdo_token.write(usdo_token);
        storage.xusdo_token.write(xusdo_token);
        storage.zec_token.write(zec_token);
        
        // Set default params (scaled by PRECISION 1e9)
        let p = get_precision();
        storage.floor_price_pf.write(100 * p); // Example $100 floor
        storage.alpha_high_buffer.write(500_000_000); // 0.5
        storage.beta_bonus.write(10_000_000); // 0.01
        storage.gamma_fee.write(100_000_000); // 0.1
        storage.delta_discount.write(50_000_000); // 0.05
        storage.kappa_emergency.write(800_000_000); // 0.8
        
        storage.phi_participation.write(700_000_000); // 0.7
        storage.lambda_decay.write(20_000_000); // 0.02
        storage.psi_floor_protection.write(1_100_000_000); // 1.1
    }

    #[public]
    fn deposit_and_mint(zec_amount: u128) {
        assert(storage.emergency_mode.read() == false, "Emergency mode active");
        
        let sender = context.msg_sender();
        
        // 1. Pull ZEC (Assuming public transfer for now)
        // Token::at(storage.zec_token.read()).transfer_public(sender, context.this_address(), zec_amount).call(&mut context);
        
        // 2. Get Prices
        let pf = storage.floor_price_pf.read();
        let alpha = storage.alpha_high_buffer.read();
        let oracle = storage.zec_oracle.read();
        // Call public get_price
        let selector = FunctionSelector::from_signature("get_price_public()");
        let args: [Field; 0] = [];
        let ret = context.call_public_function(oracle, selector, args, GasOpts::default());
        let pm = ret[0] as u128;
        
        let precision = get_precision();
        let pt = pf * (precision + alpha) / precision;
        
        // 3. Determine Zone & Compute Mints
        let mut usdo_minted: u128 = 0;
        let mut xusdo_minted: u128 = 0;
        
        if pm >= pt {
            // Zone 1: High Confidence
            let beta = storage.beta_bonus.read();
            let gamma = storage.gamma_fee.read();
            
            usdo_minted = zec_amount * pf * (precision + beta) / precision / precision;
            
            let excess_price = pm - pf;
            xusdo_minted = zec_amount * excess_price * (precision - gamma) / precision / precision;
            
            // VAP Update
            let extra = zec_amount * (pm - pt) / precision;
            let current_vap = storage.vap_balance_usd.read();
            storage.vap_balance_usd.write(current_vap + extra);
            
        } else if pm >= pf {
            // Zone 2: Caution
            let delta = storage.delta_discount.read();
            let gamma = storage.gamma_fee.read();
            
            let numerator = pt - pm;
            let denominator = pt - pf;
            let discount_term = delta * numerator / denominator;
            let multiplier = precision - discount_term;
            
            usdo_minted = zec_amount * pf * multiplier / precision / precision;
            
            let two_gamma = gamma * 2;
            xusdo_minted = zec_amount * (pm - pf) * (precision - two_gamma) / precision / precision;
            
        } else {
            // Zone 3: Emergency
            let kappa = storage.kappa_emergency.read();
            usdo_minted = zec_amount * pm * kappa / precision / precision;
            xusdo_minted = 0;
        }
        
        // 4. Update Reserves & Supply
        let new_reserve = storage.total_reserve_zec.read() + zec_amount;
        let new_usdo_supply = storage.total_usdo_supply.read() + usdo_minted;
        let new_xusdo_supply = storage.total_xusdo_supply.read() + xusdo_minted;
        
        // Solvency check
        let rhs = new_usdo_supply * precision;
        let lhs = new_reserve * pf;
        assert(lhs >= rhs, "Solvency violated");
        
        storage.total_reserve_zec.write(new_reserve);
        storage.total_usdo_supply.write(new_usdo_supply);
        storage.total_xusdo_supply.write(new_xusdo_supply);
        
        // 5. Mint Tokens (Public)
        if usdo_minted > 0 {
            let token_address = storage.usdo_token.read();
            let mint_selector = FunctionSelector::from_signature("mint_public((Field),u128)");
            let args = [sender.to_field(), usdo_minted as Field];
            context.call_public_function(token_address, mint_selector, args, GasOpts::default());
        }
        if xusdo_minted > 0 {
            let token_address = storage.xusdo_token.read();
            let mint_selector = FunctionSelector::from_signature("mint_public((Field),u128)");
            let args = [sender.to_field(), xusdo_minted as Field];
            context.call_public_function(token_address, mint_selector, args, GasOpts::default());
        }
        
        // Store timestamp for redemption
        storage.last_mint_timestamp.at(sender).write(context.timestamp() as u64);
    }

    #[public]
    fn redeem_usdo_for_zec(usdo_amount: u128) {
        let sender = context.msg_sender();
        
        // 1. Get Prices
        let pf = storage.floor_price_pf.read();
        let oracle = storage.zec_oracle.read();
        let selector = FunctionSelector::from_signature("get_price_public()");
        let args: [Field; 0] = [];
        let ret = context.call_public_function(oracle, selector, args, GasOpts::default());
        let pm = ret[0] as u128;
        
        assert(pm >= pf * 9 / 10, "Price too low for normal redemption");
        
        // 2. Calculate Redemption Value
        // Using last_mint_timestamp as a simplified "position age"
        let mint_timestamp = storage.last_mint_timestamp.at(sender).read();
        let now = context.timestamp() as u64;
        let t_days = (now - mint_timestamp) / 86400;
        
        let phi = storage.phi_participation.read();
        let lambda = storage.lambda_decay.read();
        let psi = storage.psi_floor_protection.read();
        
        let precision = get_precision();
        let ratio = pm * precision / pf;
        let excess_ratio = if ratio > precision { ratio - precision } else { 0 };
        
        let decay = exp_decay(lambda, t_days);
        
        let boost_term = phi * excess_ratio / precision * decay / precision;
        let redeem_multiplier = precision + boost_term;
        
        let redeemable_usd = usdo_amount * redeem_multiplier / precision;
        
        let floor_protected = pf * psi / precision;
        let denom_price = max(pm, floor_protected);
        
        let zec_out = redeemable_usd * precision / denom_price;
        
        // 3. Checks & Updates
        let reserves = storage.total_reserve_zec.read();
        assert(zec_out <= reserves, "Insufficient reserves");
        
        storage.total_reserve_zec.write(reserves - zec_out);
        storage.total_usdo_supply.write(storage.total_usdo_supply.read() - usdo_amount);
        
        // 4. Burn USDO & Send ZEC
        let token_address = storage.usdo_token.read();
        let burn_selector = FunctionSelector::from_signature("burn_public((Field),u128)");
        let args = [sender.to_field(), usdo_amount as Field];
        context.call_public_function(token_address, burn_selector, args, GasOpts::default());
        // Token::at(storage.zec_token.read()).transfer_public(context.this_address(), sender, zec_out).call(&mut context);
    }
    
    #[public]
    fn check_and_trigger_emergency() {
        let pf = storage.floor_price_pf.read();
        let oracle = storage.zec_oracle.read();
        let selector = FunctionSelector::from_signature("get_price_public()");
        let args: [Field; 0] = [];
        let ret = context.call_public_function(oracle, selector, args, GasOpts::default());
        let pm = ret[0] as u128;
        
        if pm < pf * 9 / 10 {
            storage.emergency_mode.write(true);
        }
        
        let s = storage.total_usdo_supply.read();
        let r = storage.total_reserve_zec.read();
        
        let precision = get_precision();
        if s * precision > r * pf * 15 / 10 {
            storage.emergency_mode.write(true);
        }
    }
}
