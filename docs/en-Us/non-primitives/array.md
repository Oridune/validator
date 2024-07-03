---
description: Learn about the available options, methods and use cases.
---

# array

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.array(
    e.string(), // Optionally pass a validator
    {} // Optionally pass options
)
.validate([]) // returns []
```

### Options

Following are the available options for this validator

```typescript
interface IArrayValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<"typeError" | "smallerLength" | "greaterLength", TErrorMessage>
  >;

  /** Validate array minimum length */
  minLength?: number;

  /** Validate array maximum length */
  maxLength?: number;

  /**
   * Partialize the underlying validator (makes undefined values in the props acceptable)
   *
   * Use e.partial() instead, if working with typescript
   */
  partial?: boolean;

  /**
   * Converts the underlying validator's props that are partialized/optional to required
   *
   * Use e.required() instead, if working with typescript
   */
  required?: boolean;

  /**
   * (Casting Option) Requires `cast` to be `true`
   */
  splitter?: string | RegExp;

  /**
   * (Casting Option) Requires `cast` to be `true`
   */
  ignoreNanKeys?: boolean;

  /**
   * (Casting Option) Requires `cast` and `ignoreNanKeys` to be `true`
   */
  pushNanKeys?: boolean;

  /**
   * (Casting Option) Requires `cast` to be `true`
   */
  noCastSingularToArray?: boolean;
}
```

### Methods

Following are the available methods on this validator

```typescript
.length(options: { min?: number; max?: number } | number)
```

```typescript
.min(length: number)
```

```typescript
.max(length: number)
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

```typescript
// Validate an array
await e.array().validate([]); // returns []
```

#### Case 2 (Usage with other validators)

```typescript
// Validate an array of string
await e.array(e.string()).validate(["foo", "bar"]); // returns ["foo", "bar"]

// Validate an array of object
await e.array(e.object({ foo: e.string() })).validate([{ foo: "bar" }]); // returns [{ foo: "bar" }]
```

#### Case 3 (With casting)

```typescript
// Validate a JSON string
await e.cast(
    e.array(
        e.string()
    )
)
.validate('["foo", "bar"]'); // returns ["foo", "bar"]
```
