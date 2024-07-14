---
description: Learn about the available options, methods and use cases.
---

# and

Combine multiple validators to create an intersection or a group of validators. This validator accepts a list of validators and validates them all to consider a value to be validated. If any of the validators fails, the whole validator will fail.

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.and([
    e.object({ name: e.string() }, { allowUnexpectedProps: true }),
    e.object({ age: e.number() }, { allowUnexpectedProps: true }),
  ]
)
.validate({ name: "John", age: 18 }); // returns { name: "John", age: 18 }
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IAndValidatorOptions extends TBaseValidatorOptions {
    // No specific options...
}
```
{% endcode %}

### Methods

Following are the available methods on this validator

```typescript
// Add more intersection
.and<V extends BaseValidator>(validator: V | (() => V))
```
