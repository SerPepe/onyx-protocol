import { createPXEClient, waitForPXE, Contract } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';

async function testDeploy() {
    const pxe = createPXEClient(PXE_URL);
    await waitForPXE(pxe);
    console.log('Connected to PXE');

    const [deployer] = await getInitialTestAccountsWallets(pxe);
    console.log(`Deployer: ${deployer.getAddress()}`);

    console.log('Deploying example TokenContract...');
    const token = await TokenContract.deploy(deployer, deployer.getAddress(), 'TestToken', 'TST', 18)
        .send({ from: deployer.getAddress() })
        .deployed();

    console.log(`✅ TokenContract deployed successfully at ${token.address}`);
    console.log('\n🎉 Sandbox deployment WORKS! The issue is with our contract artifacts.');
}

testDeploy().catch((err) => {
    console.error('❌ Deployment failed:', err.message);
    process.exit(1);
});
