---
description: Learn about the available options, methods and use cases.
---

# null

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

e.null(
    {} // Optionally pass options
);
```

### Options

Following are the available options for this validator

```typescript
interface INullValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

```typescript
// Validate null
await e.null().validate(null) // returns null
```

#### Case 2 (Passing options)

```typescript
// Validate null
await e.null({
    messages: {
        typeError: "Not a null!",
    }
}).validate(1) // throws ValidationException
```
