---
description: Learn about the available options, methods and use cases.
---

# required

## Usage

Following is the simple usage of this validator

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

### Options

Following are the available options for this validator

```typescript
interface IRequiredValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
  // No specific options...
}
```
