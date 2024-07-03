---
description: Learn about the available options, methods and use cases.
---

# bigint

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

e.bigint(
    {} // Optionally pass options
);
```

### Options

Following are the available options for this validator

```typescript
interface IBigIntValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Using validator options)

```typescript
// Cast string/number to bigint
await e.bigint({ cast: true }).validate("1") // returns 1n

// Alternatively you can do this (Using a utility validator)
await e.cast(e.bigint()).validate("0") // returns 0n
await e.cast(e.boolean()).validate(1) // returns 1n
await e.cast(e.boolean()).validate("true") // throws ValidationException
```
