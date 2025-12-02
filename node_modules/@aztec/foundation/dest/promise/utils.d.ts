export type PromiseWithResolvers<T> = {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
};
/**
 * A polyfill for the Promise.withResolvers proposed API.
 * @see https://github.com/tc39/proposal-promise-with-resolvers
 * @returns A promise with resolvers.
 */
export declare function promiseWithResolvers<T>(): PromiseWithResolvers<T>;
//# sourceMappingURL=utils.d.ts.map