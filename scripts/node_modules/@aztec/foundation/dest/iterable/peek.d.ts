export interface Peek<T> {
    peek(): IteratorResult<T, undefined>;
}
export interface AsyncPeek<T> {
    peek(): Promise<IteratorResult<T, undefined>>;
}
export interface Push<T> {
    push(value: T): void;
}
export type Peekable<T> = Iterable<T> & Peek<T> & Push<T> & Iterator<T>;
export type AsyncPeekable<T> = AsyncIterable<T> & AsyncPeek<T> & Push<T> & AsyncIterator<T>;
/**
 * Utility function that allows peeking into the contents of an async iterator.
 * @param iterable - The async iterator to peek the values of.
 */
declare function peekable<T>(iterable: Iterable<T>): Peekable<T>;
declare function peekable<T>(iterable: AsyncIterable<T>): AsyncPeekable<T>;
export { peekable as peek };
//# sourceMappingURL=peek.d.ts.map