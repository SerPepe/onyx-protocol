import { Contract, createPXEClient } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';
const ARTIFACTS_DIR = resolve(__dirname, '../src/artifacts');

async function main() {
    console.log('Connecting to PXE...');
    const pxe = createPXEClient(PXE_URL);
    const wallets = await getInitialTestAccountsWallets(pxe);
    const deployer = wallets[0];
    const deployerAddress = deployer.getAddress();

    console.log(`Deployer: ${deployerAddress.toString()}`);

    // 1. Deploy PriceOracle
    console.log('\n=== Deploying PriceOracle ===');
    const PriceOracleArtifact = JSON.parse(
        readFileSync(resolve(ARTIFACTS_DIR, 'PriceOracle-PriceOracle.json'), 'utf8')
    );

    try {
        const priceOracle = await Contract.deploy(
            deployer,
            PriceOracleArtifact,
            [100000000000n, deployerAddress]
        )
            .send({ from: deployerAddress })
            .deployed();

        const priceOracleAddress = priceOracle.address.toString();
        console.log(`✅ PriceOracle deployed at ${priceOracleAddress}`);

        // 2. Deploy ZToken
        console.log('\n=== Deploying ZToken ===');
        const ZTokenArtifact = JSON.parse(
            readFileSync(resolve(ARTIFACTS_DIR, 'ZToken-ZToken.json'), 'utf8')
        );

        const zToken = await Contract.deploy(
            deployer,
            ZTokenArtifact,
            [1000000n, deployerAddress]
        )
            .send({ from: deployerAddress })
            .deployed();

        const zTokenAddress = zToken.address.toString();
        console.log(`✅ ZToken deployed at ${zTokenAddress}`);

        // 3. Deploy USDOToken
        console.log('\n=== Deploying USDOToken ===');
        const USDOTokenArtifact = JSON.parse(
            readFileSync(resolve(ARTIFACTS_DIR, 'USDOToken-USDOToken.json'), 'utf8')
        );

        const usdoToken = await Contract.deploy(
            deployer,
            USDOTokenArtifact,
            [deployerAddress]
        )
            .send({ from: deployerAddress })
            .deployed();

        const usdoTokenAddress = usdoToken.address.toString();
        console.log(`✅ USDOToken deployed at ${usdoTokenAddress}`);

        // 4. Deploy XUsdoToken
        console.log('\n=== Deploying XUsdoToken ===');
        const XUsdoTokenArtifact = JSON.parse(
            readFileSync(resolve(ARTIFACTS_DIR, 'XUsdoToken-XUsdoToken.json'), 'utf8')
        );

        const xUsdoToken = await Contract.deploy(
            deployer,
            XUsdoTokenArtifact,
            [deployerAddress]
        )
            .send({ from: deployerAddress })
            .deployed();

        const xUsdoTokenAddress = xUsdoToken.address.toString();
        console.log(`✅ XUsdoToken deployed at ${xUsdoTokenAddress}`);

        // 5. Deploy UsdoVault
        console.log('\n=== Deploying UsdoVault ===');
        const UsdoVaultArtifact = JSON.parse(
            readFileSync(resolve(ARTIFACTS_DIR, 'UsdoVault-UsdoVault.json'), 'utf8')
        );

        const usdoVault = await Contract.deploy(
            deployer,
            UsdoVaultArtifact,
            [
                deployerAddress,
                priceOracle.address,
                usdoToken.address,
                xUsdoToken.address,
                zToken.address
            ]
        )
            .send({ from: deployerAddress })
            .deployed();

        const usdoVaultAddress = usdoVault.address.toString();
        console.log(`✅ UsdoVault deployed at ${usdoVaultAddress}`);

        // 6. Set Vault in Tokens
        console.log('\n=== Setting Vault in Tokens ===');
        await usdoToken.methods.set_vault(usdoVault.address).send().wait();
        console.log('✅ Vault set in USDOToken');

        await xUsdoToken.methods.set_vault(usdoVault.address).send().wait();
        console.log('✅ Vault set in XUsdoToken');

        // 7. Initialize Oracle Price
        console.log('\n=== Initializing Oracle Price ===');
        await priceOracle.methods.set_price(100000000000n).send().wait();
        console.log('✅ Oracle price initialized to $100');

        console.log('\n=== 🎉 Deployment Complete ===');
        console.log(`PriceOracle: ${priceOracleAddress}`);
        console.log(`ZToken: ${zTokenAddress}`);
        console.log(`USDOToken: ${usdoTokenAddress}`);
        console.log(`XUsdoToken: ${xUsdoTokenAddress}`);
        console.log(`UsdoVault: ${usdoVaultAddress}`);

    } catch (error) {
        console.error('\n❌ Deployment failed:');
        if (error instanceof Error) {
            console.error(error.message);
            console.error(error.stack);
        } else {
            console.error(error);
        }
        throw error;
    }
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
