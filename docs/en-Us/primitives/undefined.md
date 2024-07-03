---
description: Learn about the available options, methods and use cases.
---

# undefined

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.undefined(
    {} // Optionally pass options
)
.validate(undefined) // returns undefined
```

### Options

Following are the available options for this validator

```typescript
interface IUndefinedValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Using validator options)

```typescript
// Casts empty string or null to undefined
await e.undefined({ cast: true }).validate("") // returns undefined

// Alternatively you can do this (Using a utility validator)
await e.cast(e.undefined()).validate(null) // returns undefined
await e.cast(e.undefined()).validate("true") // throws ValidationException
```
