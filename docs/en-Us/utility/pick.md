---
description: Learn about the available options, methods and use cases.
---

# pick

This utility validator allows one to pick a list of useful properties from an object validator and dump the rest. The object validator will not be successful if any of the rest of the properties are received from the input.

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
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
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IPickValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
  // No specific options...
}
```
{% endcode %}
