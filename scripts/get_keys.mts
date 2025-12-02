import { createPXEClient, waitForPXE } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';

async function getTestAccountKeys() {
    const pxe = createPXEClient(PXE_URL);
    await waitForPXE(pxe);

    const wallets = await getInitialTestAccountsWallets(pxe);

    for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i];
        const address = wallet.getAddress();
        // Get secret key from the wallet's signer
        // const secretKey = await wallet.getEncryptionSecret();
        console.log(`Account ${i}:`);
        console.log(`Address: ${address}`);
        // console.log(`Secret Key: ${secretKey.toString()}`);
        console.log('Wallet keys:', Object.keys(wallet));
        // @ts-ignore
        if (wallet.secretKey) console.log('Secret Key prop:', wallet.secretKey.toString());
        // @ts-ignore
        if (wallet.signingKey) console.log('Signing Key prop:', wallet.signingKey.toString());
        // @ts-ignore
        if (wallet.account.secretKey) console.log('Account Secret Key:', wallet.account.secretKey.toString());
        console.log();
    }
}

getTestAccountKeys().catch(console.error);
