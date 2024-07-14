---
description: Learn about the available options, methods and use cases.
---

# omit

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.omit(
    // e.omit accepts e.object
    e.object({
        foo: e.string(),
        bar: e.number(),
        baz: e.boolean(),
    }),
    ["baz"],
    {} // Optionally pass options
)
.validate({ foo: "bar", bar: 10 }) // returns { foo: "bar", bar: 10 }
```

### Options

Following are the available options for this validator

```typescript
interface IOmitValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
  // No specific options...
}
```
