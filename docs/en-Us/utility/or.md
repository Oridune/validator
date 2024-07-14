---
description: Learn about the available options, methods and use cases.
---

# or

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.or([e.string(), e.number(), e.boolean()])
.validate(10); // returns 10
```

### Options

Following are the available options for this validator

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

### Methods

Following are the available methods on this validator

```typescript
// Add more unions
.or<V extends BaseValidator>(validator: V | (() => V))
```
