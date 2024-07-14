---
description: Learn about the available options, methods and use cases.
---

# number

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.number(
    {} // Optionally pass options
)
.validate(10) // returns 10
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
export interface INumberValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<
      | "typeError"
      | "smallerLength"
      | "greaterLength"
      | "smallerAmount"
      | "greaterAmount"
      | "notInt"
      | "notFloat",
      TErrorMessage
    >
  >;

  /** Validate number is int */
  isInt?: boolean;

  /** Validate number is float */
  isFloat?: boolean;

  /** Validate number minimum length */
  minLength?: number;

  /** Validate number maximum length */
  maxLength?: number;

  /** Validate number minimum length */
  minAmount?: number;

  /** Validate number maximum length */
  maxAmount?: number;
}
```
{% endcode %}

### Methods

Following are the available methods on this validator

```typescript
.length(options: { min?: number; max?: number } | number)
```

```typescript
.amount(options: { min?: number; max?: number } | number)
```

```typescript
.min(amount: number)
```

```typescript
.max(amount: number)
```

<pre class="language-typescript"><code class="lang-typescript"><strong>.int()
</strong></code></pre>

```typescript
.float()
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Using validator options)

{% code lineNumbers="true" %}
```typescript
// Cast string to number
await e.number({ cast: true }).validate("1") // returns 1

// Alternatively you can do this (Using a utility validator)
await e.cast(e.number()).validate("1") // returns 1
```
{% endcode %}

#### Case 2 (Using validator methods)

{% code lineNumbers="true" %}
```typescript
// Validate Float
await e.number({
            messages: {
                  notFloat: "Not a float!"
            }
      })
      .float()
      .validate(1.02) // returns 1.02
```
{% endcode %}
