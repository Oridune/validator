---
description: Learn about the available options, methods and use cases.
---

# boolean

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

e.boolean(
    {} // Optionally pass options
);

// Alternatives
e.true();
e.false();
```

### Options

Following are the available options for this validator

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

### Examples

Read the examples below to understand different use cases

#### Case 1 (Using validator options)

```typescript
// Cast string to number
await e.boolean({ cast: true }).validate("1") // returns true

// Alternatively you can do this (Using a utility validator)
await e.cast(e.boolean()).validate("0") // returns false
await e.cast(e.boolean()).validate(1) // returns true
await e.cast(e.boolean()).validate("true") // returns true
```

#### Case 2 (Alternative methods)

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
