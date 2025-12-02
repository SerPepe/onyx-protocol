import { getContractClassFromArtifact } from '@aztec/stdlib/contract';
import { computeArtifactHashPreimage } from '@aztec/stdlib/contract';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactsDir = path.join(__dirname, '../src/artifacts');

async function debugHash() {
    const file = 'ZToken.json';
    const filePath = path.join(artifactsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const artifact = JSON.parse(content);

    console.log(`Debugging ${file}...`);

    const contractClass = await getContractClassFromArtifact(artifact);
    console.log('Class ID:', contractClass.id.toString());
    console.log('Artifact Hash:', contractClass.artifactHash.toString());

    const preimage = await computeArtifactHashPreimage(artifact);
    console.log('Private Root:', preimage.privateFunctionRoot.toString());
    console.log('Utility Root:', preimage.utilityFunctionRoot.toString());
    console.log('Metadata Hash:', preimage.metadataHash.toString());
}

debugHash().catch(console.error);
