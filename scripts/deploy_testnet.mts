import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NODE_URL = 'https://aztec-testnet-fullnode.zkv.xyz';
const SPONSORED_FPC = '0x299f255076aa461e4e94a843f0275303470a6b8ebe7cb44a471c66711151e529';
const ARTIFACTS_DIR = resolve(__dirname, '../src/artifacts');

// Your wallet alias (created via aztec-wallet create-account)
const DEPLOYER_ALIAS = 'onyx-deployer';

function runCommand(command: string, waitTime = 60000): string {
    try {
        console.log(`\n🔧 Running: ${command}\n`);
        const output = execSync(command, {
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: waitTime
        });
        console.log(output);
        return output;
    } catch (error: any) {
        console.error(`❌ Command failed: ${command}`);
        console.error(error.stdout);
        console.error(error.stderr);
        throw error;
    }
}

function deployContract(
    artifactName: string,
    args: string[],
    alias: string
): string {
    const artifactPath = resolve(ARTIFACTS_DIR, artifactName);
    const argsStr = args.join(' ');

    const command = `aztec-wallet deploy \\
        --node-url ${NODE_URL} \\
        --from accounts:${DEPLOYER_ALIAS} \\
        --payment method=fpc-sponsored,fpc=contracts:sponsoredfpc \\
        --alias ${alias} \\
        ${artifactPath} \\
        --args ${argsStr} \\
        --no-wait`;

    const output = runCommand(command, 120000); // 2 min timeout

    // Extract address from output
    const match = output.match(/Contract deployed at (0x[a-fA-F0-9]+)/);
    if (!match) {
        // Try to extract from "registered as" line
        const aliasMatch = output.match(/registered as '([^']+)'/);
        if (aliasMatch) {
            console.log(`✅ ${alias} registered, checking status...`);
            return 'pending'; // Will need to check status
        }
        throw new Error(`Could not parse contract address from output`);
    }
    return match[1];
}

async function main() {
    console.log('🚀 Deploying Onyx Protocol to Aztec Testnet\n');
    console.log(`Node URL: ${NODE_URL}`);
    console.log(`Deployer: ${DEPLOYER_ALIAS}\n`);

    const deployedAddresses: Record<string, string> = {};

    try {
        // 1. Deploy PriceOracle
        console.log('📊 Deploying PriceOracle...');
        const oracleAddr = deployContract(
            'PriceOracle-PriceOracle.json',
            ['100000000000', `accounts:${DEPLOYER_ALIAS}`],
            'priceoracle'
        );
        deployedAddresses.priceOracle = oracleAddr;
        console.log(`✅ PriceOracle: ${oracleAddr}\n`);

        // 2. Deploy ZToken (collateral)
        console.log('🪙 Deploying ZToken...');
        const zTokenAddr = deployContract(
            'ZToken-ZToken.json',
            ['1000000', `accounts:${DEPLOYER_ALIAS}`],
            'ztoken'
        );
        deployedAddresses.zToken = zTokenAddr;
        console.log(`✅ ZToken: ${zTokenAddr}\n`);

        // 3. Deploy USDOToken
        console.log('💵 Deploying USDOToken...');
        const usdoAddr = deployContract(
            'USDOToken-USDOToken.json',
            [`accounts:${DEPLOYER_ALIAS}`],
            'usdotoken'
        );
        deployedAddresses.usdoToken = usdoAddr;
        console.log(`✅ USDOToken: ${usdoAddr}\n`);

        // 4. Deploy XUsdoToken
        console.log('🎫 Deploying XUsdoToken...');
        const xUsdoAddr = deployContract(
            'XUsdoToken-XUsdoToken.json',
            [`accounts:${DEPLOYER_ALIAS}`],
            'xusdotoken'
        );
        deployedAddresses.xUsdoToken = xUsdoAddr;
        console.log(`✅ XUsdoToken: ${xUsdoAddr}\n`);

        // 5. Deploy UsdoVault
        console.log('🏦 Deploying UsdoVault...');
        const vaultAddr = deployContract(
            'UsdoVault-UsdoVault.json',
            [
                `accounts:${DEPLOYER_ALIAS}`,
                `contracts:priceoracle`,
                `contracts:usdotoken`,
                `contracts:xusdotoken`,
                `contracts:ztoken`
            ],
            'usdovault'
        );
        deployedAddresses.usdoVault = vaultAddr;
        console.log(`✅ UsdoVault: ${vaultAddr}\n`);

        // Save addresses
        console.log('\n📝 Deployment Summary:\n');
        console.log(JSON.stringify(deployedAddresses, null, 2));

        console.log('\n✅ All contracts deployed to testnet!');
        console.log('\n🔍 Track transactions on:');
        console.log('   https://testnet.aztecscan.io');
        console.log('   https://testnet.aztecexplorer.com');

    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        console.log('\n📋 Partial deployment addresses:');
        console.log(JSON.stringify(deployedAddresses, null, 2));
        process.exit(1);
    }
}

main().catch(console.error);
