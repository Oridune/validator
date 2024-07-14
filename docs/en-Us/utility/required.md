---
description: Learn about the available options, methods and use cases.
---

# required

Converts all the properties of the object validator to the required. The object validator will not be successfully validated if any of the properties are not passed or any property is undefined.

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.required(
    PartializedObjectValidator, // Pass a partialized object, to convert to required.
    {} // Optionally pass options
)
.validate({ foo: undefined }) // throws ValidationException (foo is required)

// Alternative
await e.deepRequired(
    PartializedObjectValidator, // Pass a deep partial object, to convert to required.
)
.validate({ foo: 10, bar: {} }) // throws ValidationException (bar may not be empty)
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IRequiredValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
  // No specific options...
}
```
{% endcode %}
