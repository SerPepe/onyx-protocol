/**
 * Stop iteration after n items have been received.
 * @param source - An iterable to take n items from.
 * @param limit - The number of items to take from the iterable.
 * @returns A generator, limited to n items.
 */
declare function take<T>(source: Iterable<T>, limit: number): Generator<T, void, undefined>;
declare function take<T>(source: Iterable<T> | AsyncIterable<T>, limit: number): AsyncGenerator<T, void, undefined>;
export { take };
//# sourceMappingURL=take.d.ts.map