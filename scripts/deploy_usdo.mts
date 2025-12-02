import { execSync } from 'child_process';
import { resolve } from 'path';

const SECRET_KEY = '0x2153536ff6628eee01cf4024889ff977a18d9fa61d0e414422f7681cf085c281';
const DEPLOYER_ADDRESS = '0x2735b31fb4c6dc2f407bc468669a7edb40a580626f06c4c4e1bfacbae4e9d24a';
const ARTIFACTS_DIR = resolve(process.cwd(), 'src/artifacts');

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

function deploy(artifactName: string, args: string[]): string {
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

function send(contractAddress: string, functionName: string, args: string[]) {
    const argsStr = args.join(' ');
    const command = `aztec send ${functionName} --contract-address ${contractAddress} --args ${argsStr} -sk ${SECRET_KEY}`;
    runCommand(command);
}

async function main() {
    console.log('Starting deployment using aztec-cli...');

    // 1. Deploy Price Oracle
    console.log('Deploying PriceOracle...');
    const priceOracleAddress = deploy('PriceOracle-PriceOracle.json', ['100000000000', DEPLOYER_ADDRESS]);
    console.log(`PriceOracle deployed at ${priceOracleAddress}`);

    // 2. Deploy ZToken (Collateral)
    console.log('Deploying ZToken...');
    const zTokenAddress = deploy('ZToken-ZToken.json', ['1000000', DEPLOYER_ADDRESS]);
    console.log(`ZToken deployed at ${zTokenAddress}`);

    // 3. Deploy USDO Token
    console.log('Deploying USDOToken...');
    const usdoTokenAddress = deploy('USDOToken-USDOToken.json', [DEPLOYER_ADDRESS]);
    console.log(`USDOToken deployed at ${usdoTokenAddress}`);

    // 4. Deploy XUsdo Token
    console.log('Deploying XUsdoToken...');
    const xUsdoTokenAddress = deploy('XUsdoToken-XUsdoToken.json', [DEPLOYER_ADDRESS]);
    console.log(`XUsdoToken deployed at ${xUsdoTokenAddress}`);

    // 5. Deploy UsdoVault
    console.log('Deploying UsdoVault...');
    const usdoVaultAddress = deploy('UsdoVault-UsdoVault.json', [
        DEPLOYER_ADDRESS,
        priceOracleAddress,
        usdoTokenAddress,
        xUsdoTokenAddress,
        zTokenAddress
    ]);
    console.log(`UsdoVault deployed at ${usdoVaultAddress}`);

    // 6. Set Vault in Tokens
    console.log('Setting Vault in Tokens...');
    send(usdoTokenAddress, 'set_vault', [usdoVaultAddress]);
    send(xUsdoTokenAddress, 'set_vault', [usdoVaultAddress]);
    console.log('Vault set in tokens');

    // 7. Initialize Oracle Price (already set in constructor, but setting again to verify interaction)
    console.log('Initializing Oracle Price...');
    send(priceOracleAddress, 'set_price', ['100000000000']);
    console.log('Oracle Price set to $100');

    console.log('\n=== Deployment Complete ===');
    console.log(`PriceOracle: ${priceOracleAddress}`);
    console.log(`ZToken: ${zTokenAddress}`);
    console.log(`USDOToken: ${usdoTokenAddress}`);
    console.log(`XUsdoToken: ${xUsdoTokenAddress}`);
    console.log(`UsdoVault: ${usdoVaultAddress}`);
}

main().catch(console.error);
