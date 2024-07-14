---
description: Learn about the available options, methods and use cases.
---

# and

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.and([
    e.object({ name: e.string() }, { allowUnexpectedProps: true }),
    e.object({ age: e.number() }, { allowUnexpectedProps: true }),
  ]
)
.validate({ name: "John", age: 18 }); // returns { name: "John", age: 18 }
```

### Options

Following are the available options for this validator

```typescript
interface IAndValidatorOptions extends TBaseValidatorOptions {
    // No specific options...
}
```

### Methods

Following are the available methods on this validator

```typescript
// Add more intersection
.and<V extends BaseValidator>(validator: V | (() => V))
```
