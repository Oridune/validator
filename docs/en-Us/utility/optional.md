---
description: Learn about the available options, methods and use cases.
---

# optional

You can pass any validator to this utility and make it optional. If an undefined value is received from the input, it will skip the validation and optionally return a default value.

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.optional(e.string())
.validate() // returns undefined
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IOptionalValidatorOptions extends TBaseValidatorOptions {
    // No specific options...
}
```
{% endcode %}

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

{% code lineNumbers="true" %}
```typescript
// Default if undefined
await e.optional(
    e.number() // Any validator is allowed
).default(null)
.validate() // returns null
```
{% endcode %}

#### Case 2 (Use with object)

{% code lineNumbers="true" %}
```typescript
await e.object({
    foo: e.optional(e.string()),
    bar: e.optional(e.number()).default(0)
})
.validate({}) // returns { bar: 0 }
```
{% endcode %}
