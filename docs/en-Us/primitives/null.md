---
description: Learn about the available options, methods and use cases.
---

# null

## Usage

Following is the simple usage of this validator

<pre class="language-typescript" data-line-numbers><code class="lang-typescript">import e from "validator";

<strong>await e.null(
</strong>    {} // Optionally pass options
)
.validate(null) // returns null
</code></pre>

### Options

Following are the available options for this validator

{% code lineNumbers="true" %}
```typescript
interface INullValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "castOptions"> {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}
```
{% endcode %}

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

{% code lineNumbers="true" %}
```typescript
// Validate null
await e.null().validate(null) // returns null
```
{% endcode %}

#### Case 2 (Passing options)

{% code lineNumbers="true" %}
```typescript
// Validate null
await e.null({
    messages: {
        typeError: "Not a null!",
    }
}).validate(1) // throws ValidationException
```
{% endcode %}
