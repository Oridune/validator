---
description: Learn about the available options, methods and use cases.
---

# string

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.string(
    {} // Optionally pass options
)
.validate("foo") // returns "foo"
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IStringValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<
      | "typeError"
      | "smallerLength"
      | "greaterLength"
      | "matchFailed"
      | "invalidChoice"
      | "numberLike"
      | "notNumberLike"
      | "invalidURL",
      TErrorMessage
    >
  >;

  /** Validate string as URL */
  isUrl?: boolean;

  /** Transform string to URL object. (isUrl option is required) */
  returnURLInstance?: boolean;

  /** Validate string minimum length */
  minLength?: number;

  /** Validate string maximum length */
  maxLength?: number;

  /** Pass a string enum */
  choices?: string[];

  /** Pass a list of acceptable regular expressions */
  patterns?: RegExp[];

  /** Validate if string isNaN */
  isNaN?: boolean;
}
```
{% endcode %}

### Methods

Following are the available methods on this validator

```typescript
.length(options: { min?: number; max?: number } | number)
```

```typescript
.min(length: number)
```

```typescript
.max(length: number)
```

```typescript
.matches(options: { regex: RegExp | RegExp[] } | RegExp | RegExp[])
```

```typescript
.in<C extends string>(choices: C[])
```

```typescript
.isNaN()
```

```typescript
.notIsNaN()
```

```typescript
.isURL<URLInstance extends boolean = false>(
    returnURLInstance?: URLInstance
)
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Using validator options)

{% code lineNumbers="true" %}
```typescript
// Cast number to string
await e.string({ cast: true }).validate(1) // returns "1"

// Alternatively you can do this (Using a utility validator)
await e.cast(e.string()).validate(1) // returns "1"
```
{% endcode %}

#### Case 2 (Using validator methods)

{% code lineNumbers="true" %}
```typescript
// Validate Email
await e.string({
            messages: {
                  matchFailed: "Invalid email!"
            }
      })
      .matches(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,63})$/)
      .validate("test@mail.com") // returns "test@mail.com"
```
{% endcode %}

#### Case 3

{% code lineNumbers="true" %}
```typescript
// Validate string with particular length
await e.string().length({ min: 3, max: 10 })
      .validate("food") // returns "food"
      
await e.string().length({ min: 3, max: 10 })
      .validate("") // throws ValidationException
```
{% endcode %}
