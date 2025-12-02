import { createPXEClient, waitForPXE } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';

async function main() {
    console.log('Starting test script...');
    const path = resolve(process.cwd(), 'src/artifacts/PriceOracle.json');
    console.log('Loading artifact from:', path);
    const artifact = JSON.parse(readFileSync(path, 'utf-8'));
    console.log('Artifact loaded');
}

main().catch(console.error);
