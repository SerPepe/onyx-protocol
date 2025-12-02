/**
 * Collects all values from an (async) iterable and returns them as an array
 * @param source - Iterable to collect all values from
 * @returns All of the iterable's values as an array.
 */
declare function all<T>(source: Iterable<T>): T[];
declare function all<T>(source: Iterable<T> | AsyncIterable<T>): Promise<T[]>;
export { all };
//# sourceMappingURL=all.d.ts.map