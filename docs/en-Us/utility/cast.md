---
description: Learn about the available options, methods and use cases.
---

# cast

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.cast(
    e.number(),
    {} // Optionally pass options
)
.validate("10") // returns 10

// Alternative
await e.deepCast(
    e.object({
        foo: e.number(),
    })
)
.validate('{ "foo": "10" }') // returns { foo: 10 }
```

### Options

Following are the available options for this validator

```typescript
interface ICastValidatorOptions
  extends Omit<TBaseValidatorOptions, "optional"> {
  /**
   * Enable casting of all the deeply nested validators
   */
  deepCast?: boolean;
}
```
