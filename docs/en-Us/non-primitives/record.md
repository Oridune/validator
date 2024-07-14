---
description: Learn about the available options, methods and use cases.
---

# record

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.record(
    e.string(), // Pass any validator (Required)
    {} // Optionally pass options
)
.validate({}) // returns {}
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IRecordValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;

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
   * Pass a key validator for validating the keys of the record specifically
   */
  key?: BaseValidator<any, any, any>;

  /** Delete any undefined props */
  deletePropertyIfUndefined?: boolean;
}
```
{% endcode %}

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

{% code lineNumbers="true" %}
```typescript
// Validate a record or string
await e.record(e.string())
.validate({ foo: "bar" }); // returns { foo: "bar" }

// Validate a record of boolean
await e.record(e.boolean())
.validate({ foo: true, bar: true }); // returns { foo: true, bar: true }

// Validate a record of object
await e.record(e.object({ bar: e.string() }))
.validate({ foo: { bar: "baz" } }); // returns { foo: { bar: "baz" } }
```
{% endcode %}

#### Case 3 (With casting)

{% code lineNumbers="true" %}
```typescript
// Validate a JSON string
await e.cast(
    e.record(
        e.string()
    )
)
.validate('{ "foo": "bar" }'); // returns { foo: "bar" }
```
{% endcode %}
