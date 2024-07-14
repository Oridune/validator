---
description: Learn about the available options, methods and use cases.
---

# tuple

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.tuple(
    [e.string(), e.boolean()], // Pass a list of validators
    {} // Optionally pass options
)
.validate(["foo", true]) // returns ["foo", true]
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface ITupleValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<"typeError" | "smallerLength" | "greaterLength", TErrorMessage>
  >;

  /** Validate array minimum length */
  minLength?: number;

  /** Validate array maximum length */
  maxLength?: number;

  /**
   * Partialize the underlying validator (makes undefined values in the props acceptable)
   *
   * Use e.partial() instead, if working with typescript
   */
  partial?: boolean;

  /**
   * Converts the underlying validator's props that are partialized/optional to required
   *
   * Use e.required() instead, if working with typescript
   */
  required?: boolean;

  /**
   * (Casting Option) Requires `cast` to be `true`
   *
   * Set a splitter that will be used to split elements in the string and convert it into array during the cast.
   */
  splitter?: string | RegExp;
}
```
{% endcode %}

### Methods

Following are the available methods on this validator

```typescript
// Pass a rest validator that validates unexpected items in the tuple
.rest(validator: BaseValidator<any, any, any>)
```

```typescript
.length(options: { min?: number; max?: number } | number)
```

```typescript
.min(length: number)
```

```typescript
.max(length: number)
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

{% code lineNumbers="true" %}
```typescript
// Validate a tuple
await e.tuple([e.string(), e.number()]).validate(["foo", 1]); // returns ["foo", 1]
```
{% endcode %}

#### Case 2 (Usage with rest validator)

{% code lineNumbers="true" %}
```typescript
// Validate a tuple with string as rest of the items
await e.tuple([
    e.string(), 
    e.number()
]) // type [string, number]
.rest(e.string()) // type [string, number, ...string[]]
.validate(["foo", 1, "a", "b", "c"]); // returns ["foo", 1, "a", "b", "c"]
```
{% endcode %}

#### Case 3 (With casting)

{% code lineNumbers="true" %}
```typescript
// Validate a JSON string
await e.cast(
    e.tuple([
        e.string(),
        e.number(),
        e.boolean()
    ])
) // type [string, number, boolean]
.validate('["foo", 1, true]'); // returns ["foo", 1, true]
```
{% endcode %}
