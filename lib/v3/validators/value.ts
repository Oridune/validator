// deno-lint-ignore-file no-explicit-any
import util from "node:util";

export class Value<T> {
    constructor(
        public value: T,
        public metadata: Record<string, any> = {},
    ) {
        if (value instanceof Value) {
            this.value = value.value;
            this.metadata = Object.assign(metadata, value.metadata);
        }
    }

    valueOf() {
        if (
            typeof this.value === "object" && this.value !== null &&
            "valueOf" in this.value &&
            typeof this.value.valueOf === "function"
        ) {
            return this.value.valueOf();
        }

        return this.value;
    }

    toString() {
        if (
            typeof this.value === "object" && this.value !== null &&
            "toString" in this.value &&
            typeof this.value.toString === "function"
        ) {
            return this.value.toString();
        }

        return `${this.value}`;
    }

    toJSON() {
        if (
            typeof this.value === "object" && this.value !== null &&
            "toJSON" in this.value && typeof this.value.toJSON === "function"
        ) {
            return this.value.toJSON();
        }

        return this.value;
    }

    [Symbol.toPrimitive]() {
        return this.value;
    }

    [util.inspect.custom](_: any, options: any) {
        return `[Value: ${util.inspect(this.value, options)}, ${
            util.inspect(this.metadata, options)
        }]`;
    }
}

export const createValue = <T>(value: T, metadata?: Record<string, any>) => {
    const wrapper = new Value(value, metadata) as
        & Value<T>
        & T;

    return new Proxy(wrapper, {
        get: (target, prop, receiver) => {
            if (prop in target) {
                return Reflect.get(target, prop, receiver);
            }

            if (
                typeof target.value === "object" && target.value !== null &&
                prop in target.value
            ) {
                const value = Reflect.get(target.value, prop, receiver);

                if (typeof value === "function") {
                    return value.bind(target.value);
                }

                return value;
            }

            return undefined;
        },
        set: (target, prop, value, receiver) => {
            if (prop in target) {
                return Reflect.set(target, prop, value, receiver);
            }

            if (typeof target.value === "object" && target.value !== null) {
                return Reflect.set(target.value, prop, value, receiver);
            }

            return false;
        },
        ownKeys: (target) => {
            if (typeof target.value === "object" && target.value !== null) {
                return Reflect.ownKeys(target).concat(
                    Reflect.ownKeys(target.value),
                );
            }

            return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor: (target, prop) => {
            if (prop in target) {
                return Object.getOwnPropertyDescriptor(target, prop);
            }

            return Object.getOwnPropertyDescriptor(target.value, prop);
        },
    });
};
