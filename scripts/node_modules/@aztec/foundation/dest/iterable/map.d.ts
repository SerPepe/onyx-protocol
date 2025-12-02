/**
 * Takes an (async) iterable and returns one with each item mapped by the passed
 * function.
 * @param source - The iterable to run the map function on.
 * @param func - The function to run over the iterable's items.
 * @returns A generator of the mapped items.
 */
declare function map<I, O>(source: Iterable<I>, func: (val: I, index: number) => Promise<O>): AsyncGenerator<O, void, undefined>;
declare function map<I, O>(source: Iterable<I>, func: (val: I, index: number) => O): Generator<O, void, undefined>;
declare function map<I, O>(source: AsyncIterable<I> | Iterable<I>, func: (val: I, index: number) => O | Promise<O>): AsyncGenerator<O, void, undefined>;
export { map };
//# sourceMappingURL=map.d.ts.map