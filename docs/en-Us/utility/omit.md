---
description: Learn about the available options, methods and use cases.
---

# omit

This utility removes any useless properties from the object validator shape. The object validator will throw an error if any omitted property is received from the input.

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
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
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IOmitValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
  // No specific options...
}
```
{% endcode %}
