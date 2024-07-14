---
description: Learn about the available options, methods and use cases.
---

# bigint

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.bigint(
    {} // Optionally pass options
)
.validate(1n) // returns 1n
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IBigIntValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}
```
{% endcode %}

### Examples

Read the examples below to understand different use cases

#### Case 1 (Using validator options)

{% code lineNumbers="true" %}
```typescript
// Cast string/number to bigint
await e.bigint({ cast: true }).validate("1") // returns 1n

// Alternatively you can do this (Using a utility validator)
await e.cast(e.bigint()).validate("0") // returns 0n
await e.cast(e.bigint()).validate(1) // returns 1n
await e.cast(e.bigint()).validate("true") // throws ValidationException
```
{% endcode %}
