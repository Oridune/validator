---
description: Learn about the available options, methods and use cases.
---

# if

This utility allows you to mark a value as successfully validated if it meets a specific condition. You can use this utility validator if you want to get the input validated based on external specifications or conditions.

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.if(
    (value) => !isNaN(value),
    {} // Pass optional options...
)
.validate("10") // returns "10"
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IIfValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}
```
{% endcode %}

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

{% code lineNumbers="true" %}
```typescript
// Validate if conditions meet
await e.if((value) => isRightTime(value))
.validate(new Date) // returns new Date()

// Passes if user is active
await e.if((user) => user.isActive)
.validate(User) // returns User
```
{% endcode %}
