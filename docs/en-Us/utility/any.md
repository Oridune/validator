---
description: Learn about the available options, methods and use cases.
---

# any

This utility validator accepts any value and will always be successful no matter what has been passed. You can use this validator for generating dynamic values combined with `.custom` method.

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

### Examples

Read the examples below to understand different use cases

#### Case 1 (Generate dynamic value)

{% code lineNumbers="true" %}
```typescript
// The following example shows how to generate a new value based on other props.
await e.object({
    firstName: e.string(),
    lastName: e.string(),
    
    // Generate a full name
    fullName: e.any().custom(ctx => {
        return `${ctx.parent.output.firstName} ${ctx.parent.output.lastName}`;
    })
})
.validate({
    firstName: "Saif Ali",
    lastName: "Khan"
}) // returns { firstName: "Saif Ali", lastName: "Khan", fullName: "Saif Ali Khan" }
```
{% endcode %}
