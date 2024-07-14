---
description: Learn about the available options, methods and use cases.
---

# or

This validator takes a list of validators and creates a union of validators. If any of these validators is successfully validated, the whole validator will be considered validated.

## Usage

Following is the simple usage of this validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

await e.or([e.string(), e.number(), e.boolean()])
.validate(10); // returns 10
```
{% endcode %}

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface IOrValidatorOptions extends TBaseValidatorOptions {
  /**
   * By default all the string validators are moved at the end of the union validators for better validator matching.
   * 
   * Pass `true` to disable validators sorting.
   */
  disableValidatorSorting?: boolean;
}
```
{% endcode %}

### Methods

Following are the available methods on this validator

```typescript
// Add more unions
.or<V extends BaseValidator>(validator: V | (() => V))
```
