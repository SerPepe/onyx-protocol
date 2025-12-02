import { createPXEClient, waitForPXE, Contract, AztecAddress } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import ZTokenJson from '../src/artifacts/ZToken.json' with { type: 'json' };
import PriceOracleJson from '../src/artifacts/PriceOracle.json' with { type: 'json' };
import OnyxVaultJson from '../src/artifacts/OnyxVault.json' with { type: 'json' };

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';

// Deployed addresses
const ZTOKEN_ADDRESS = '0x20295a4ea9023cca213f1bf6b91d95843bb5ed4291fdc24545d999a95b794f77';
const ORACLE_ADDRESS = '0x1f6a9dece032b19e3def0a21b724e8f13b84b2fdefd4b49e798f34020b874e50';
const USDO_ADDRESS = '0x13d206fd7fa6e4116f5eb11cbae3f18de9025018f5e4deba73b2b53b59811f6d';
const VAULT_ADDRESS = '0x29dbc4632253b47cc11f6939f465020112b4ced1eacfd4e4765fa6d2dc7fc086';

async function main() {
    const pxe = createPXEClient(PXE_URL);
    await waitForPXE(pxe);
    console.log('Connected to PXE');

    const [deployer, alice] = await getInitialTestAccountsWallets(pxe);
    console.log(`Deployer: ${deployer.getAddress()}`);
    console.log(`Alice: ${alice.getAddress()}`);

    // Connect to contracts (bypass Class ID check)
    const mockZECMetadata = await deployer.getContractMetadata(AztecAddress.fromString(ZTOKEN_ADDRESS));
    // @ts-ignore
    const mockZEC = new Contract(mockZECMetadata.contractInstance!, ZTokenJson as any, deployer);

    const priceOracleMetadata = await deployer.getContractMetadata(AztecAddress.fromString(ORACLE_ADDRESS));
    // @ts-ignore
    const priceOracle = new Contract(priceOracleMetadata.contractInstance!, PriceOracleJson as any, deployer);

    const onyxVaultMetadata = await deployer.getContractMetadata(AztecAddress.fromString(VAULT_ADDRESS));
    // @ts-ignore
    const onyxVault = new Contract(onyxVaultMetadata.contractInstance!, OnyxVaultJson as any, deployer);

    console.log('Connected to contracts');

    // 1. Set Price
    console.log('Setting ZEC price to 50 USDO...');
    await priceOracle.methods.set_price(50n).send({ from: deployer.getAddress() }).wait();
    console.log('Price set successfully');

    // 2. Mint ZEC to Alice
    console.log('Minting 1000 mockZEC to Alice...');
    await mockZEC.methods.mint(1000n, alice.getAddress()).send({ from: deployer.getAddress() }).wait();
    console.log('Minted successfully');

    // 3. Check Balance
    // Note: get_balance is unconstrained/utility,    // 3. Check Balance
    // console.log('Checking balance...');
    // const balance = await mockZEC.methods.get_balance(alice.getAddress()).simulate({});
    // console.log(`Alice balance: ${balance}`);

    console.log('\n=== Setup Complete ===');
}

main().catch(console.error);
