/**
 * Filters the passed (async) iterable by using the filter function.
 * @param source - An iterable to filter.
 * @returns A generator of the filtered values.
 */
declare function filter<T>(source: Iterable<T>, fn: (val: T, index: number) => Promise<boolean>): AsyncGenerator<T, void, undefined>;
declare function filter<T>(source: Iterable<T>, fn: (val: T, index: number) => boolean): Generator<T, void, undefined>;
declare function filter<T>(source: Iterable<T> | AsyncIterable<T>, fn: (val: T, index: number) => boolean | Promise<boolean>): AsyncGenerator<T, void, undefined>;
export { filter };
//# sourceMappingURL=filter.d.ts.map