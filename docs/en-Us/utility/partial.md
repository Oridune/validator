---
description: Learn about the available options, methods and use cases.
---

# partial

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.partial(
    e.object({
        foo: e.string(),
        bar: e.number(),
    }),
    {} // Optionally pass options
)
.validate({ foo: "bar" }) // returns { foo: "bar" }

// Alternative
await e.deepPartial(
    e.object({
        foo: e.number(),
        bar: e.object({
            baz: e.boolean()
        }),
    })
)
.validate({ foo: 10, bar: {} }) // returns { foo: 10, bar: {} }
```

### Options

Following are the available options for this validator

```typescript
interface IPartialValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
  // No specific options...
}
```
