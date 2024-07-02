---
description: Learn about the available options, methods and use cases.
---

# string

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

e.string(
    {} // Optionally pass options
);
```

### Options

Following are the available options for this validator

<pre class="language-typescript"><code class="lang-typescript"><strong>interface IStringValidatorOptions extends TBaseValidatorOptions {
</strong>  // Pass custom messages for the errors
  messages?: Partial&#x3C;
    Record&#x3C;
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
  
  // Validate string as URL
  isUrl?: boolean;
  
  // Transform string to URL object. (isUrl option is required)
  returnURLInstance?: boolean;
  
  // Validate string minimum length
  minLength?: number;
  
  // Validate string maximum length
  maxLength?: number;
  
  // Pass a string enum
  choices?: string[];
  
  // Pass a list of acceptable regular expressions
  patterns?: RegExp[];
  
  // Validate if string isNaN
  isNaN?: boolean;
}
</code></pre>

### Methods

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

```typescript
// Cast number to string
await e.string({ cast: true }).validate(1) // returns "1"

// Alternatively you can do this (Using a utility validator)
await e.cast(e.string()).validate(1) // returns "1"
```

#### Case 2 (Using validator methods)

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

#### Case 3

```typescript
// Validate string with particular length
await e.string().length({ min: 3, max: 10 })
      .validate("food") // returns "food"
      
await e.string().length({ min: 3, max: 10 })
      .validate("") // throws ValidationException
```
