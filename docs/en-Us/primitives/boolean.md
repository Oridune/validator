---
description: Learn about the available options, methods and use cases.
---

# boolean

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.boolean(
    {} // Optionally pass options
)
.validate(true) // returns true

// Alternatives
e.true();
e.false();
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IBooleanValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<"typeError" | "notTrue" | "notFalse", TErrorMessage>
  >;

  /** Validate expected value to be true or false */
  expected?: boolean;
}
```
{% endcode %}

### Examples

Read the examples below to understand different use cases

#### Case 1 (Using validator options)

{% code lineNumbers="true" %}
```typescript
// Cast string to boolean
await e.boolean({ cast: true }).validate("1") // returns true

// Alternatively you can do this (Using a utility validator)
await e.cast(e.boolean()).validate("0") // returns false
await e.cast(e.boolean()).validate(1) // returns true
await e.cast(e.boolean()).validate("true") // returns true
```
{% endcode %}

#### Case 2 (Alternative methods)

{% code lineNumbers="true" %}
```typescript
// Validate True
await e.true({
            messages: {
                  notTrue: "Value is not true!"
            }
      })
      .validate(false) // throws ValidationException
      
// Validate False
await e.false({
            messages: {
                  notFalse: "Value is not false!"
            }
      })
      .validate(true) // throws ValidationException
```
{% endcode %}
