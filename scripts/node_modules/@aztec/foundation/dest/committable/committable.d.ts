/**
 * A class that allows for a value to be committed or rolled back.
 */
export declare class Committable<T> {
    private currentValue;
    private nextValue;
    constructor(initialValue: T);
    /**
     * Commits the uncommitted value.
     */
    commit(): void;
    /**
     * Rolls back the uncommitted value.
     */
    rollback(): void;
    /**
     * Gets the current value.
     * @param includeUncommitted - Whether to include the uncommitted value.
     * @returns The current value if includeUncommitted is false, otherwise the uncommitted value.
     */
    get(includeUncommitted?: boolean): T;
    /**
     * Sets the next value to be committed to.
     * @param value - The new value to be set.
     */
    set(value: T): void;
}
//# sourceMappingURL=committable.d.ts.map