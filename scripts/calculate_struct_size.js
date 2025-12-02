const fs = require('fs');
const path = require('path');

const artifactPath = path.resolve(__dirname, '../src/artifacts/ZToken-ZToken.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

function calculateSize(type) {
    if (type.kind === 'struct') {
        let size = 0;
        for (const field of type.fields) {
            size += calculateSize(field.type);
        }
        return size;
    } else if (type.kind === 'array') {
        return type.length * calculateSize(type.type);
    } else if (type.kind === 'integer' || type.kind === 'field' || type.kind === 'boolean') {
        return 1;
    } else if (type.kind === 'string') {
        return type.length; // Or is it length in fields? Strings are usually bytes.
        // Assuming string length is in bytes, and packed?
        // But Noir ABI usually treats string as array of bytes (fields?).
        // Let's assume 1 field per char for now, or check type definition.
        // type.length is number of bytes?
        // If it's `str<N>`, it's N bytes.
        // In Aztec, it might be packed.
        // But PrivateContextInputs doesn't have strings.
        return type.length;
    }
    return 0;
}

const constructor = artifact.functions.find(f => f.name === 'constructor');
const inputsParam = constructor.parameters.find(p => p.name === 'inputs');

if (!inputsParam) {
    console.error('No inputs parameter found');
    process.exit(1);
}

const size = calculateSize(inputsParam.type);
console.log(`Size in fields: ${size}`);
console.log(`Hex string: 0x${'00'.repeat(size * 32)}`);
