/**
 * A number generator which is used as a source of randomness in the system. If the SEED env variable is set, the
 * generator will be deterministic and will always produce the same sequence of numbers. Otherwise a true randomness
 * sourced by crypto library will be used.
 * @remarks This class was implemented so that tests can be run deterministically.
 *
 * TODO(#3949): This is not safe enough for production and should be made safer or removed before mainnet.
 */
export declare class RandomnessSingleton {
    private readonly seed?;
    private readonly log;
    private static instance;
    private counter;
    private constructor();
    static getInstance(): RandomnessSingleton;
    /**
     * Indicates whether the generator is deterministic (was seeded) or not.
     * @returns Whether the generator is deterministic.
     */
    isDeterministic(): boolean;
    getBytes(length: number): Buffer;
}
//# sourceMappingURL=randomness_singleton.d.ts.map