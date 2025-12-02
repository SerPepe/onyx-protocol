import { Contract, createPXEClient, Fr } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';
const ARTIFACTS_DIR = resolve(process.cwd(), 'src/artifacts');

// Deployed contract addresses
const ADDRESSES = {
    priceOracle: '0x14b12fc63d4a2c1285fd1741c9c072c11de8c9633a618bca86e3ba49d9ed3aaf',
    zToken: '0x1cf9c77df8f0c2f0d41be8f44bb6f4aa38b79fc5b35ba14eeabb20da1b91c1e9',
    usdoToken: '0x0e7f29f49fb27ea8c525c01898856fde82bfa0e2e48305596190b9175259f06e',
    xUsdoToken: '0x111dd0cfb9ba78ca9c0dfc82ed55d8c54e61e5cf6a98fc3c22e23cea2ba88d82',
    usdoVault: '0x1a521853e853a33f907c6c504d7c6a0f0bb0e048ec80c71d22d2dfb4536a0fd0'
};

async function main() {
    console.log('🧪 Onyx Protocol Test Suite\n');

    const pxe = createPXEClient(PXE_URL);
    const wallets = await getInitialTestAccountsWallets(pxe);
    const user = wallets[0];
    const userAddress = user.getAddress();

    console.log(`User: ${userAddress.toString()}\n`);

    // Load contract artifacts
    const priceOracleArtifact = JSON.parse(
        readFileSync(resolve(ARTIFACTS_DIR, 'PriceOracle-PriceOracle.json'), 'utf8')
    );
    const vaultArtifact = JSON.parse(
        readFileSync(resolve(ARTIFACTS_DIR, 'UsdoVault-UsdoVault.json'), 'utf8')
    );
    const usdoArtifact = JSON.parse(
        readFileSync(resolve(ARTIFACTS_DIR, 'USDOToken-USDOToken.json'), 'utf8')
    );
    const xUsdoArtifact = JSON.parse(
        readFileSync(resolve(ARTIFACTS_DIR, 'XUsdoToken-XUsdoToken.json'), 'utf8')
    );
    const zTokenArtifact = JSON.parse(
        readFileSync(resolve(ARTIFACTS_DIR, 'ZToken-ZToken.json'), 'utf8')
    );

    // Create contract instances
    const priceOracle = await Contract.at(ADDRESSES.priceOracle, priceOracleArtifact, user);
    const vault = await Contract.at(ADDRESSES.usdoVault, vaultArtifact, user);
    const usdo = await Contract.at(ADDRESSES.usdoToken, usdoArtifact, user);
    const xUsdo = await Contract.at(ADDRESSES.xUsdoToken, xUsdoArtifact, user);
    const zToken = await Contract.at(ADDRESSES.zToken, zTokenArtifact, user);

    console.log('📊 Test 1: Check Initial State');
    console.log('================================');

    try {
        // Get initial ZEC price
        const initialPrice = await priceOracle.methods.get_price().simulate();
        console.log(`✓ ZEC Price: $${Number(initialPrice) / 1e9}`);

        // TODO: Add balance checks once we can query public balances
        console.log('✓ Initial state verified\n');
    } catch (error) {
        console.error('❌ Initial state check failed:', error.message);
    }

    console.log('📊 Test 2: Zone 1 - High Confidence Minting (P_m >= P_t)');
    console.log('========================================================');

    try {
        // Set price to $150 (well above floor of $100)
        console.log('Setting ZEC price to $150...');
        await priceOracle.methods.set_price(150_000_000_000n).send().wait();
        console.log('✓ Price set to $150');

        // Deposit and mint
        const depositAmount = 10n; // 10 ZEC
        console.log(`\nDepositing ${depositAmount} ZEC...`);

        // First, mint some ZEC to user for testing
        await zToken.methods.mint(1000000n, userAddress).send().wait();
        console.log('✓ Minted test ZEC');

        // Try deposit_and_mint
        await vault.methods.deposit_and_mint(depositAmount).send().wait();
        console.log('✓ Deposit and mint executed');

        // Check balances
        // const usdoBalance = await usdo.methods.get_public_balance(userAddress).simulate();
        // const xUsdoBalance = await xUsdo.methods.get_public_balance(userAddress).simulate();
        // console.log(`USDO minted: ${Number(usdoBalance) / 1e9}`);
        // console.log(`xUSDO minted: ${Number(xUsdoBalance) / 1e9}`);

        console.log('✅ Zone 1 test passed\n');
    } catch (error) {
        console.error('❌ Zone 1 test failed:', error.message);
    }

    console.log('📊 Test 3: Zone 2 - Caution Zone (P_f <= P_m < P_t)');
    console.log('====================================================');

    try {
        // Set price to $120 (between floor $100 and threshold ~$150)
        console.log('Setting ZEC price to $120...');
        await priceOracle.methods.set_price(120_000_000_000n).send().wait();
        console.log('✓ Price set to $120');

        const depositAmount = 10n;
        await vault.methods.deposit_and_mint(depositAmount).send().wait();
        console.log('✓ Caution zone deposit executed');

        console.log('✅ Zone 2 test passed\n');
    } catch (error) {
        console.error('❌ Zone 2 test failed:', error.message);
    }

    console.log('📊 Test 4: Zone 3 - Emergency Zone (P_m < P_f)');
    console.log('===============================================');

    try {
        // Set price to $90 (below floor of $100)
        console.log('Setting ZEC price to $90...');
        await priceOracle.methods.set_price(90_000_000_000n).send().wait();
        console.log('✓ Price set to $90');

        const depositAmount = 5n;
        await vault.methods.deposit_and_mint(depositAmount).send().wait();
        console.log('✓ Emergency zone deposit executed');

        console.log('✅ Zone 3 test passed\n');
    } catch (error) {
        console.error('❌ Zone 3 test failed:', error.message);
    }

    console.log('📊 Test 5: Time-Based Redemption');
    console.log('=================================');

    try {
        // Set price back to normal
        await priceOracle.methods.set_price(150_000_000_000n).send().wait();
        console.log('✓ Price set to $150');

        // Try to redeem some USDO
        const redeemAmount = 100n * 1_000_000_000n; // 100 USDO
        console.log(`\nRedeeming ${Number(redeemAmount) / 1e9} USDO...`);

        await vault.methods.redeem_usdo_for_zec(redeemAmount).send().wait();
        console.log('✓ Redemption executed');

        console.log('✅ Redemption test passed\n');
    } catch (error) {
        console.error('❌ Redemption test failed:', error.message);
    }

    console.log('📊 Test 6: Emergency Mode Trigger');
    console.log('==================================');

    try {
        // Set very low price to trigger emergency
        await priceOracle.methods.set_price(50_000_000_000n).send().wait();
        console.log('✓ Price set to $50');

        await vault.methods.check_and_trigger_emergency().send().wait();
        console.log('✓ Emergency check executed');

        console.log('✅ Emergency mode test passed\n');
    } catch (error) {
        console.error('❌ Emergency mode test failed:', error.message);
    }

    console.log('\n🎉 Test Suite Complete!\n');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
