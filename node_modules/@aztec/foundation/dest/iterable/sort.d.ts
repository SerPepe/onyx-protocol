export interface CompareFunction<T> {
    (a: T, b: T): number;
}
/**
 * Collects all values from an async iterator, sorts them
 * using the passed function and yields them.
 * @param source - Iterable to sort.
 * @param sorter - Sorting function.
 * @returns A generator of the sorted values.
 */
declare function sort<T>(source: Iterable<T>, sorter: CompareFunction<T>): Generator<T, void, undefined>;
declare function sort<T>(source: Iterable<T> | AsyncIterable<T>, sorter: CompareFunction<T>): AsyncGenerator<T, void, undefined>;
export { sort };
//# sourceMappingURL=sort.d.ts.map