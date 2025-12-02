import { EthAddress } from '@aztec/foundation/eth-address';
import { Fr } from '@aztec/foundation/fields';
import { BufferReader } from '@aztec/foundation/serialize';
/**
 * The sender of an L1 to L2 message or recipient of an L2 to L1 message.
 */
export declare class L1Actor {
    /**
     * The sender of the message.
     */
    readonly sender: EthAddress;
    /**
     * The chain id on which the message was sent (L1 -> L2) or on which the message will be received (L2 -> L1).
     */
    readonly chainId: number;
    constructor(
    /**
     * The sender of the message.
     */
    sender: EthAddress, 
    /**
     * The chain id on which the message was sent (L1 -> L2) or on which the message will be received (L2 -> L1).
     */
    chainId: number);
    static empty(): L1Actor;
    toFields(): Fr[];
    toBuffer(): Buffer;
    static fromBuffer(buffer: Buffer | BufferReader): L1Actor;
    static random(): L1Actor;
}
//# sourceMappingURL=l1_actor.d.ts.map