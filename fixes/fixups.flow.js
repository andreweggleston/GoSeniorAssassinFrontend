// Pulled straight from, but has some mixed->any relaxations to fix
// some autocomplete bugs; DONT COMMIT
declare class Object {
    static (o: ?void): {[key: any]: any};
    static (o: boolean): Boolean;
    static (o: number): Number;
    static (o: string): String;
    static <T: Object>(o: T): T;
    static assign: Object$Assign;
    static create(o: any, properties?: any): any;
    static defineProperties(o: any, properties: any): any;
    static defineProperty(o: any, p: any, attributes: any): any;
    static entries(object: any): Array<[string, any]>;
    static freeze<T>(o: T): T;
    static getOwnPropertyDescriptor(o: any, p: any): any;
    static getOwnPropertyNames(o: any): Array<string>;
    static getOwnPropertySymbols(o: any): Symbol[];
    static getPrototypeOf: Object$GetPrototypeOf;
    static is(a: any, b: any): boolean;
    static isExtensible(o: any): boolean;
    static isFrozen(o: any): boolean;
    static isSealed(o: any): boolean;
    static keys(o: any): Array<string>;
    static preventExtensions(o: any): any;
    static seal(o: any): any;
    static setPrototypeOf(o: any, proto: ?Object): bool;
    static values(object: any): Array<any>;
    hasOwnProperty(prop: any): boolean;
    propertyIsEnumerable(prop: any): boolean;
    toLocaleString(): string;
    toString(): string;
    valueOf(): Object;
    [key:any]: any;
}
