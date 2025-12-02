const fs = require('fs');
const path = require('path');

const artifactPath = path.resolve(__dirname, '../src/artifacts/ZToken-ZToken.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

function generateDummy(type) {
    if (type.kind === 'struct') {
        const result = {};
        for (const field of type.fields) {
            result[field.name] = generateDummy(field.type);
        }
        return result;
    } else if (type.kind === 'array') {
        const result = [];
        for (let i = 0; i < type.length; i++) {
            result.push(generateDummy(type.type));
        }
        return result;
    } else if (type.kind === 'integer') {
        return 0; // or "0"
    } else if (type.kind === 'field') {
        return "0x0000000000000000000000000000000000000000000000000000000000000000";
    } else if (type.kind === 'boolean') {
        return false;
    } else if (type.kind === 'string') {
        return "";
    }
    return null;
}

const constructor = artifact.functions.find(f => f.name === 'constructor');
const inputsParam = constructor.parameters.find(p => p.name === 'inputs');

if (!inputsParam) {
    console.error('No inputs parameter found in constructor');
    process.exit(1);
}

const dummyInputs = generateDummy(inputsParam.type);
console.log(JSON.stringify(dummyInputs));
