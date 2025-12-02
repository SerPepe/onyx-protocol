/**
 * Measures the elapsed execution time of a function call or promise once it is awaited.
 * @param fn - Function or promise.
 * @returns The number of ms and the result.
 */
export declare function elapsed<T>(fn: Promise<T> | (() => T | Promise<T>)): Promise<[number, T]>;
/**
 * Measures the elapsed execution time of a synchronous function call once it is awaited.
 * @param fn - Function.
 * @returns The number of ms and the result.
 */
export declare function elapsedSync<T>(fn: () => T): [number, T];
//# sourceMappingURL=elapsed.d.ts.map