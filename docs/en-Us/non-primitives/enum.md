---
description: Learn about the available options, methods and use cases.
---

# enum

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.enum(
  ["pending", "done"] as const,
  {} // Optionally pass options
)
.validate("done") // returns "done"
```

### Options

Following are the available options for this validator

```typescript
interface IEnumValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError" | "invalidChoice", TErrorMessage>>;
}
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

```typescript
// Validate choice
await e.enum(["pending", "done"] as const).validate("done") // returns "done"
```

#### Case 2 (Usage with typescript enum)

```typescript
// Create a typescript enum and pass it to the validator
enum Status {
  pending = "pending",
  processing = "processing",
  completed = "completed",
}

await e.enum(
  // In order to translate a typescript enum to a validator understandable enum
  // Use Object.values
  Object.values(Status)
)
.validate(Status.processing) // returns "processing"
```

#### Case 3 (in method)

```typescript
// e.in is the same as e.enum
await e.in(["pending", "done"] as const).validate("done") // returns "done"
```
