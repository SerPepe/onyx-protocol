import { createPXEClient } from '@aztec/aztec.js';

const PXE_URL = 'http://localhost:8080';

async function main() {
    try {
        console.log('Step 1: Creating PXE client...');
        const pxe = createPXEClient(PXE_URL);

        console.log('Step 2: Getting node info...');
        const info = await pxe.getNodeInfo();
        console.log('Node info:', info);

        console.log('✅ Test succeeded!');
    } catch (error) {
        console.error('❌ Error:', error);
        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
        throw error;
    }
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
