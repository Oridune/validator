---
description: Learn about the available options, methods and use cases.
---

# cast

Using this utility validator, it is convenient to convert the values to relevant primitives before validating them. All validators support casting.

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
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
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface ICastValidatorOptions
  extends Omit<TBaseValidatorOptions, "optional"> {
  /**
   * Enable casting of all the deeply nested validators
   */
  deepCast?: boolean;
}
```
{% endcode %}
