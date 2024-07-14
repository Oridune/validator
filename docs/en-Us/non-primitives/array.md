---
description: Learn about the available options, methods and use cases.
---

# array

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.array(
    e.string(), // Optionally pass a validator
    {} // Optionally pass options
)
.validate([]) // returns []
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IArrayValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<
      "typeError" | "nanKey" | "smallerLength" | "greaterLength",
      TErrorMessage
    >
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

  /**
   * (Casting Option) Requires `cast` to be `true`
   *
   * Normally this validator will allow you to validate an object (like an array) if the cast is `true` and
   * properties of this object are number like.
   * But if the validator detects a NaN property on the object, it will throw a nanKey error!
   *
   * If you want to avoid nanKey error by ignoring any NaN keys in the object then pass `true` here.
   */
  ignoreNanKeys?: boolean;

  /**
   * (Casting Option) Requires `cast` to be `true`
   *
   * Normally this validator will allow you to validate an object (like an array) if the cast is `true` and
   * properties of this object are number like.
   * But if the validator detects a NaN property on the object, it will throw a nanKey error!
   *
   * If you want to avoid nanKey error by pushing the value of a NaN key into the resulting array then pass `true` here.
   */
  pushNanKeys?: boolean;

  /**
   * (Casting Option) Requires `cast` to be `true`
   *
   * If `cast` is `true`, the validator will try to convert a non-splitable/non-object item into an array.
   * If you pass boolean (true) into the array validator, it will cast it to [true], an array of boolean.
   *
   * If you want to disable this behavior, pass `true` here.
   */
  noCastSingularToArray?: boolean;
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

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

{% code lineNumbers="true" %}
```typescript
// Validate an array
await e.array().validate([]); // returns []
```
{% endcode %}

#### Case 2 (Usage with other validators)

{% code lineNumbers="true" %}
```typescript
// Validate an array of string
await e.array(e.string()).validate(["foo", "bar"]); // returns ["foo", "bar"]

// Validate an array of object
await e.array(e.object({ foo: e.string() })).validate([{ foo: "bar" }]); // returns [{ foo: "bar" }]
```
{% endcode %}

#### Case 3 (With casting)

{% code lineNumbers="true" %}
```typescript
// Validate a JSON string
await e.cast(
    e.array(
        e.string()
    )
)
.validate('["foo", "bar"]'); // returns ["foo", "bar"]
```
{% endcode %}
