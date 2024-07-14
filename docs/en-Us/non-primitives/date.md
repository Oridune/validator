---
description: Learn about the available options, methods and use cases.
---

# date

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.date(
    {} // Optionally pass options
)
.validate(new Date()) // returns new Date()
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IDateValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<"typeError" | "smaller" | "greater", TErrorMessage>
  >;

  /**
   * Provide a start time for validation (Use .start or .between methods)
   */
  startsAt?: Date | number;

  /**
   * Provide an ending time for validation (Use .end or .between methods)
   */
  endsAt?: Date | number;
}
```
{% endcode %}

### Methods

Following are the available methods on this validator

```typescript
// A date will be valid if it lies between a specified range
.between(options: { start?: Date | number; end?: Date | number })
```

```typescript
// A date will be valid if it starts at a specific time
.start(at: Date | number)
```

```typescript
// A date will be valid if it starts at a specific time
.end(at: Date | number)
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

{% code lineNumbers="true" %}
```typescript
// Validate date
await e.date().validate(new Date) // returns new Date()
```
{% endcode %}

#### Case 2 (Date in range)

{% code lineNumbers="true" %}
```typescript
// Validate a date that lies in a specified range
const start = new Date("01-01-2024");
const end = new Date("30-01-2024");

// With .start method
await e.date().start(start)
.validate(new Date("15-01-2024")); // returns new Date("15-01-2024")

// With .end method
await e.date().end(end)
.validate(new Date("15-01-2026")); // throws ValidationException

// With .between method
// The Above validator is the same as:
await e.date().between({ start, end })
.validate(new Date("15-01-2024"));
```
{% endcode %}
