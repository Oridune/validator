---
description: Learn about the available options, methods and use cases.
---

# if

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.if(
    (value) => !isNaN(value),
    {} // Pass optional options...
)
.validate("10") // returns "10"
```

### Options

Following are the available options for this validator

```typescript
interface IIfValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

```typescript
// Validate if conditions meet
await e.if((value) => isRightTime(value))
.validate(new Date) // returns new Date()

// Passes if user is active
await e.if((user) => user.isActive)
.validate(User) // returns User
```
