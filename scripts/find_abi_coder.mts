import { createPXEClient } from '@aztec/aztec.js';
import { AbiCoder } from '@aztec/stdlib/abi';

console.log('createPXEClient:', !!createPXEClient);
console.log('AbiCoder:', !!AbiCoder);


if (AbiCoder) {
    console.log('AbiCoder prototype:', Object.getOwnPropertyNames(AbiCoder.prototype));
}

