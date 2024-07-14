---
description: Learn about the available options, methods and use cases.
---

# optional

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.optional(e.string())
.validate() // returns undefined
```

### Options

Following are the available options for this validator

```typescript
interface IOptionalValidatorOptions extends TBaseValidatorOptions {
    // No specific options...
}
```

### Methods

Following are the available methods on this validator

```typescript
// Set a default value
.default<DefaultInput, Validate extends boolean = false>(
    value: DefaultInput,
    options?: {
      validate?: Validate;
    },
)
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

```typescript
// Default if undefined
await e.optional(
    e.number() // Any validator is allowed
).default(null)
.validate() // returns null
```

#### Case 2 (Use with object)

```typescript
await e.object({
    foo: e.optional(e.string()),
    bar: e.optional(e.number()).default(0)
})
.validate({}) // returns { bar: 0 }
```
