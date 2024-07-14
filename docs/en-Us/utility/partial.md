---
description: Learn about the available options, methods and use cases.
---

# partial

Converts all properties of the object validator to optional. The object validation will be successful even if an empty object has been passed.

You can use deepPartial utility to partialize the object deeply.

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
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
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IPartialValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
  // No specific options...
}
```
{% endcode %}
