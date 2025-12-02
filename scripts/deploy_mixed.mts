import { Contract, createPXEClient, loadContractArtifact } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';
const SECRET_KEY = '0x2153536ff6628eee01cf4024889ff977a18d9fa61d0e414422f7681cf085c281';
const DEPLOYER_ADDRESS = '0x2735b31fb4c6dc2f407bc468669a7edb40a580626f06c4c4e1bfacbae4e9d24a';
const ARTIFACTS_DIR = resolve(__dirname, '../src/artifacts');

function runCommand(command: string): string {
    try {
        console.log(`Running: ${command}`);
        const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
        return output;
    } catch (error: any) {
        console.error(`Command failed: ${command}`);
        console.error(error.stdout);
        console.error(error.stderr);
        throw error;
    }
}

function deployCLI(artifactName: string, args: string[]): string {
    const artifactPath = resolve(ARTIFACTS_DIR, artifactName);
    const argsStr = args.join(' ');
    const command = `aztec deploy ${artifactPath} --args ${argsStr} -sk ${SECRET_KEY}`;

    const output = runCommand(command);
    const match = output.match(/Contract deployed at (0x[a-fA-F0-9]+)/);
    if (!match) {
        throw new Error(`Could not parse contract address from output: ${output}`);
    }
    return match[1];
}

function sendCLI(contractAddress: string, functionName: string, args: string[]) {
    const argsStr = args.join(' ');
    const command = `aztec send ${functionName} --contract-address ${contractAddress} --args ${argsStr} -sk ${SECRET_KEY}`;
    runCommand(command);
}

async function main() {
    const pxe = createPXEClient(PXE_URL);
    const wallets = await getInitialTestAccountsWallets(pxe);
    const deployer = wallets[0];
    const deployerAddress = deployer.getAddress();

    console.log(`Deployer: ${deployerAddress.toString()}`);

    // 1. Deploy PriceOracle (CLI)
    console.log('Deploying PriceOracle (CLI)...');
    const priceOracleAddress = deployCLI('PriceOracle-PriceOracle.json', ['100000000000', DEPLOYER_ADDRESS]);
    console.log(`PriceOracle deployed at ${priceOracleAddress}`);

    // 2. Deploy ZToken (CLI)
    console.log('Deploying ZToken (CLI)...');
    const zTokenAddress = deployCLI('ZToken-ZToken.json', ['1000000', DEPLOYER_ADDRESS]);
    console.log(`ZToken deployed at ${zTokenAddress}`);

    // 3. Deploy USDOToken (CLI)
    console.log('Deploying USDOToken (CLI)...');
    const usdoTokenAddress = deployCLI('USDOToken-USDOToken.json', [DEPLOYER_ADDRESS]);
    console.log(`USDOToken deployed at ${usdoTokenAddress}`);

    // 4. Deploy XUsdoToken (CLI)
    console.log('Deploying XUsdoToken (CLI)...');
    const xUsdoTokenAddress = deployCLI('XUsdoToken-XUsdoToken.json', [DEPLOYER_ADDRESS]);
    console.log(`XUsdoToken deployed at ${xUsdoTokenAddress}`);

    // 5. Deploy UsdoVault (CLI)
    console.log('Deploying UsdoVault (CLI)...');
    const usdoVaultAddress = deployCLI('UsdoVault-UsdoVault.json', [
        DEPLOYER_ADDRESS,
        priceOracleAddress,
        usdoTokenAddress,
        xUsdoTokenAddress,
        zTokenAddress
    ]);
    console.log(`UsdoVault deployed at ${usdoVaultAddress}`);

    // 6. Set Vault in Tokens (CLI)
    console.log('Setting Vault in Tokens...');
    sendCLI(usdoTokenAddress, 'set_vault', [usdoVaultAddress]);
    sendCLI(xUsdoTokenAddress, 'set_vault', [usdoVaultAddress]);
    console.log('Vault set in tokens');

    // 7. Initialize Oracle Price (CLI)
    console.log('Initializing Oracle Price...');
    sendCLI(priceOracleAddress, 'set_price', ['100000000000']);
    console.log('Oracle Price set to $100');

    console.log('\n=== Deployment Complete ===');
    console.log(`PriceOracle: ${priceOracleAddress}`);
    console.log(`ZToken: ${zTokenAddress}`);
    console.log(`USDOToken: ${usdoTokenAddress}`);
    console.log(`XUsdoToken: ${xUsdoTokenAddress}`);
    console.log(`UsdoVault: ${usdoVaultAddress}`);
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
