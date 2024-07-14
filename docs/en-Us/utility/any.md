---
description: Learn about the available options, methods and use cases.
---

# any

## Usage

Following is the simple usage of this validator

<pre class="language-typescript"><code class="lang-typescript">import e from "validator";

await e.any() // Any validator accepts any data...
<strong>.validate({ name: "John", age: 18 }); // returns { name: "John", age: 18 }
</strong></code></pre>

### Options

Following are the available options for this validator

```typescript
interface IAnyValidatorOptions extends TBaseValidatorOptions {
    // No specific options...
}
```
