---
description: Learn about the available options, methods and use cases.
---

# instanceOf

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.instanceOf(
    Date, // Pass a constructor
    {} // Optionally pass options
)
.validate(new Date()) // returns new Date()
```

### Options

Following are the available options for this validator

```typescript
interface IInstanceOfValidatorOptions<
  AllowUndefined extends boolean,
  Input,
  RestArgs extends Array<any>,
  Args = [Input, ...RestArgs][number],
> extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;

  /**
   * If passed `true`, the validator will act as an optional validator with the default value as the instance of the class passed.
   */
  allowUndefined?: AllowUndefined;

  /**
   * If passed `true`, the validator will try to instantiate the class with the input value.
   */
  instantiate?: boolean;

  /**
   * If `instantiate` is set to `true`, the validator tries to instantiate the class with the input value in the first argument, You can pass the rest of the arguments here if any.
   */
  instantiationArgs?: Args[] | ((value: Input) => Args[] | Promise<Args[]>);

  /**
   * If `instantiate` is set to `true`, the validator tries to instantiate the class with the input value in the first argument, You can pass the rest of the arguments here if any.
   */
  instantiationRestArgs?:
    | RestArgs
    | ((value: Input) => RestArgs | Promise<RestArgs>);
}
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

```typescript
// Validate an instance of the Date constructor
await e.instanceOf(Date).validate(new Date); // returns new Date()
```

#### Case 2 (Usage with allowUndefined)

```typescript
// Validate an instance of the Date constructor or instantiate if it is undefined
await e.instanceOf(Date, { allowUndefined: true }).validate(); // returns new Date()
```

#### Case 3 (With instantiate)

```typescript
// Validate an instance of the Date constructor or instantiate using the value
// Without/Incorrect value
await e.instanceOf(ArrayBuffer, {
    instantiate: true
}).validate(); // throws ValidationException

// Without value
await e.instanceOf(Date, {
    instantiate: true
}).validate(); // returns new Date()

// With value
await e.instanceOf(ArrayBuffer, {
    instantiate: true
}).validate(10); // returns new ArrayBuffer(10)

// With all arguments
await e.instanceOf(Date, {
    instantiate: true,
    instantiationArgs: [20, 30]
}).validate(10); // returns new ArrayBuffer(20, 30)

// With rest arguments
await e.instanceOf(Date, {
    instantiate: true,
    instantiationRestArgs: [20, 30]
}).validate(10); // returns new ArrayBuffer(10, 20, 30)
```
