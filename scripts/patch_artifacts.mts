import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const TARGET_DIR = resolve(process.cwd(), 'target');
const ARTIFACTS_DIR = resolve(process.cwd(), 'src/artifacts');

function patchArtifact(artifact: any, filename: string) {
    if (!artifact.functions) return artifact;

    for (const func of artifact.functions) {
        // Map function types
        if (func.name === 'constructor') {
            if (func.custom_attributes && func.custom_attributes.includes('public')) {
                func.functionType = 'public';
            } else {
                func.functionType = 'private';
            }
        } else if (func.custom_attributes && func.custom_attributes.includes('public')) {
            func.functionType = 'public';
        } else if (func.is_unconstrained) {
            func.functionType = 'utility';
        } else if (func.custom_attributes && func.custom_attributes.includes('utility')) {
            func.functionType = 'utility';
        } else if (func.custom_attributes && func.custom_attributes.includes('private')) {
            func.functionType = 'private';
        } else {
            func.functionType = 'private';
        }

        // If mapped to utility, remove 'public' from attributes to avoid confusion
        if (func.functionType === 'utility' && func.custom_attributes) {
            func.custom_attributes = func.custom_attributes.filter((attr: string) => attr !== 'public');
        }

        console.log(`Function ${func.name}: is_unconstrained=${func.is_unconstrained}, attributes=${func.custom_attributes}, assigned=${func.functionType}`);

        // Set flags
        func.isInternal = func.custom_attributes ? func.custom_attributes.includes('internal') : false;
        func.isStatic = func.custom_attributes ? func.custom_attributes.includes('static') : false; // Or check ABI
        func.isInitializer = func.custom_attributes ? func.custom_attributes.includes('initializer') : false;

        // Move ABI fields
        if (func.abi) {
            func.parameters = func.abi.parameters || [];
            if (func.abi.return_type) {
                // Do not unwrap return types.
                // Wrapped return types seem to be accepted if constructor return type is fixed.
                // Unwrapping breaks Class ID.
                func.returnTypes = [func.abi.return_type];
            } else {
                func.returnTypes = [];
            }
            func.errorTypes = func.abi.error_types || {};
        } else {
            func.parameters = func.parameters || [];
            func.returnTypes = func.returnTypes || [];
            func.errorTypes = func.errorTypes || {};
        }

        // Force empty returnTypes for constructor
        if (func.name === 'constructor') {
            func.returnTypes = [];
        }

        // Filter out 'inputs' parameter for private functions
        if (func.functionType === 'private') {
            // Do NOT filter out inputs (breaks Class ID)
            // func.parameters = func.parameters.filter((p: any) => p.name !== 'inputs');

            // Also clear returnTypes for private functions (they have weird context structs)
            func.returnTypes = [];
        }

        // Map verification_key to verificationKey
        if (func.verification_key) {
            func.verificationKey = func.verification_key;
        }

        // Debug symbols
        if (!func.debugSymbols) {
            func.debugSymbols = "";
        }
    }

    // Filter out public_dispatch function?
    // If we keep it, we have 3 public functions.
    // If we remove it, we have 2.
    // In step 673, it worked. I assume it was present.
    // So I will NOT filter it out.
    // artifact.functions = artifact.functions.filter((f: any) => f.name !== 'public_dispatch');

    // Filter out get_price_public (generated wrapper?)
    // If it has public attribute, it will be public.
    // If we keep it, we have 4 public functions.
    // I will filter it out just in case.
    artifact.functions = artifact.functions.filter((f: any) => f.name !== 'get_price_public');

    // Ensure top-level fields
    if (!artifact.fileMap) artifact.fileMap = {};
    if (!artifact.storageLayout) artifact.storageLayout = {};
    if (!artifact.nonDispatchPublicFunctions) artifact.nonDispatchPublicFunctions = [];

    return artifact;
}

function main() {
    console.log('Patching artifacts...');
    const files = readdirSync(TARGET_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const content = readFileSync(join(TARGET_DIR, file), 'utf-8');
        const artifact = JSON.parse(content);
        const patched = patchArtifact(artifact, file);
        writeFileSync(join(ARTIFACTS_DIR, file), JSON.stringify(patched, null, 2));
    }
    console.log('Done.');
}

main();
