type Deserializable = {
    fromString(str: string): object;
};
/**
 * Register a class here that has a toJSON method that returns:
 * ```
 * {
 *   "type": "ExampleClassName",
 *   "value": <result of ExampleClassName.toString()>
 * }
 * ```
 * and has an e.g. ExampleClassName.fromString(string) method.
 * This means you can then easily serialize/deserialize the type using JSON.stringify and JSON.parse.
 */
export declare class TypeRegistry {
    private static registry;
    static register(typeName: string, constructor: Deserializable): void;
    static getConstructor(typeName: string): Deserializable | undefined;
}
export declare function resolver(_: any, value: any): any;
export declare function reviver(key: string, value: any): any;
export {};
//# sourceMappingURL=type_registry.d.ts.map