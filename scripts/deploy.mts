import { createPXEClient, waitForPXE, Contract } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import ZTokenJson from '../src/artifacts/ZToken.json' with { type: 'json' };
import PriceOracleJson from '../src/artifacts/PriceOracle.json' with { type: 'json' };
import OnyxVaultJson from '../src/artifacts/OnyxVault.json' with { type: 'json' };

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';

async function main() {
    const pxe = createPXEClient(PXE_URL);
    await waitForPXE(pxe);
    console.log('Connected to PXE');

    const [deployer, alice] = await getInitialTestAccountsWallets(pxe);
    console.log(`Deployer: ${deployer.getAddress()}`);
    console.log(`Alice: ${alice.getAddress()}`);

    // Deploy mockZEC (ZToken) with initial supply and owner
    console.log('Deploying mockZEC...');
    const mockZEC = await Contract.deploy(deployer, ZTokenJson as any, [1000000, deployer.getAddress()]).send({ from: deployer.getAddress() }).deployed();
    console.log(`mockZEC deployed at ${mockZEC.address}`);

    // Deploy PriceOracle
    console.log('Deploying PriceOracle...');
    const priceOracle = await Contract.deploy(deployer, PriceOracleJson as any, []).send({ from: deployer.getAddress() }).deployed();
    console.log(`PriceOracle deployed at ${priceOracle.address}`);

    // Deploy OnyxVault
    console.log('Deploying OnyxVault...');
    const onyxVault = await Contract.deploy(deployer, OnyxVaultJson as any, [mockZEC.address, priceOracle.address]).send({ from: deployer.getAddress() }).deployed();
    console.log(`OnyxVault deployed at ${onyxVault.address}`);

    // Setup: Set price in oracle
    console.log('Setting ZEC price to 50 USDO...');
    await priceOracle.methods.set_price(50).send({ from: deployer.getAddress() }).wait();
    console.log('Price set successfully');

    // Mint some mockZEC to Alice
    console.log('Minting 1000 mockZEC to Alice...');
    await mockZEC.methods.mint(1000, alice.getAddress()).send({ from: deployer.getAddress() }).wait();
    console.log('Minted successfully');

    console.log('\n=== Deployment Complete ===');
    console.log(`mockZEC: ${mockZEC.address}`);
    console.log(`PriceOracle: ${priceOracle.address}`);
    console.log(`OnyxVault: ${onyxVault.address}`);
}

main().catch(console.error);
