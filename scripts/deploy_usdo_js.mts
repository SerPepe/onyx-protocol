import { Contract, createPXEClient, loadContractArtifact } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';

async function main() {
    const pxe = createPXEClient(PXE_URL);
    const wallets = await getInitialTestAccountsWallets(pxe);
    const deployer = wallets[0];
    const deployerAddress = deployer.getAddress();

    console.log(`Deployer: ${deployerAddress.toString()}`);

    // Load artifacts
    const loadArtifact = (name: string) => {
        const path = resolve(__dirname, `../src/artifacts/${name}`);
        return JSON.parse(readFileSync(path, 'utf8'));
    };

    const PriceOracleArtifact = loadArtifact('PriceOracle-PriceOracle.json');
    const ZTokenArtifact = loadArtifact('ZToken-ZToken.json');
    const USDOTokenArtifact = loadArtifact('USDOToken-USDOToken.json');
    const XUsdoTokenArtifact = loadArtifact('XUsdoToken-XUsdoToken.json');
    const UsdoVaultArtifact = loadArtifact('UsdoVault-UsdoVault.json');

    // Deploy PriceOracle
    console.log('Deploying PriceOracle...');
    const priceOracle = await Contract.deploy(deployer, PriceOracleArtifact, [100000000000n, deployerAddress])
        .send({ from: deployerAddress })
        .deployed();
    console.log(`PriceOracle deployed at ${priceOracle.address}`);

    // Deploy ZToken
    console.log('Deploying ZToken...');
    const zToken = await Contract.deploy(deployer, ZTokenArtifact, [1000000n, deployerAddress])
        .send({ from: deployerAddress })
        .deployed();
    console.log(`ZToken deployed at ${zToken.address}`);

    // Deploy USDOToken
    console.log('Deploying USDOToken...');
    const usdoToken = await Contract.deploy(deployer, USDOTokenArtifact, [deployerAddress])
        .send({ from: deployerAddress })
        .deployed();
    console.log(`USDOToken deployed at ${usdoToken.address}`);

    // Deploy XUsdoToken
    console.log('Deploying XUsdoToken...');
    const xUsdoToken = await Contract.deploy(deployer, XUsdoTokenArtifact, [deployerAddress])
        .send({ from: deployerAddress })
        .deployed();
    console.log(`XUsdoToken deployed at ${xUsdoToken.address}`);

    // Deploy UsdoVault
    console.log('Deploying UsdoVault...');
    const usdoVault = await Contract.deploy(deployer, UsdoVaultArtifact, [
        deployerAddress,
        priceOracle.address,
        usdoToken.address,
        xUsdoToken.address,
        zToken.address
    ])
        .send({ from: deployerAddress })
        .deployed();
    console.log(`UsdoVault deployed at ${usdoVault.address}`);

    // Set Vault in Tokens
    console.log('Setting Vault in Tokens...');
    await usdoToken.methods.set_vault(usdoVault.address).send({ from: deployerAddress }).wait();
    await xUsdoToken.methods.set_vault(usdoVault.address).send({ from: deployerAddress }).wait();
    console.log('Vault set in tokens');

    // Initialize Oracle Price
    console.log('Initializing Oracle Price...');
    await priceOracle.methods.set_price(100000000000n).send({ from: deployerAddress }).wait();
    console.log('Oracle Price set to $100');

    console.log('\n=== Deployment Complete ===');
}

main().catch((err) => {
    console.error('Deployment failed:');
    if (err instanceof Error) {
        console.error(err.message);
        console.error(err.stack);
    } else {
        console.error(err);
    }
});
