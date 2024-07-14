---
description: Learn about the available options, methods and use cases.
---

# pick

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.pick(
    // e.pick accepts e.object
    e.object({
        foo: e.string(),
        bar: e.number(),
        baz: e.boolean(),
    }),
    ["baz"],
    {} // Optionally pass options
)
.validate({ baz: true }) // returns { baz: true }
```

### Options

Following are the available options for this validator

```typescript
interface IPickValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
  // No specific options...
}
```
