---
description: Let's see how the validator works!
---

# Basic usage

As mentioned in the [getting started page](./) Oridune validator is mostly similar to Zod. You compose smaller chunks of validators into a validations schema. See the following example:

### Create a simple validator

{% code lineNumbers="true" fullWidth="false" %}
```typescript
import e from "validator"; // validator maps to https://jsr.io/@oridune/validator

// Define a string validator
const Str = e.string();

// Validation
await Str.validate("foo"); // returns "foo"
await Str.validate(123); // throws ValidationException

// Safe Validation (doesn't throw an error if validation fails)
await Str.try("foo"); // returns { output: "foo", error: null }
await Str.try(123); // returns { output: null, error: ValidationException }

// Boolean Validation
await Str.test("foo"); // returns true
await Str.test(123); // returns false

```
{% endcode %}

### Create an object Schema

{% code lineNumbers="true" %}
```typescript
import e, {inferOutput} from "validator";

// Define an object validator
const Obj = e.object({
    username: e.string(),
});

// Validation
await Obj.validate({ username: "Saif Ali Khan" }); // returns { username: "Saif Ali Khan" }

// Infer typescript types
type User = inferOutput<typeof Obj>; // { username: string }

```
{% endcode %}

### Transform using a Custom validator

{% code lineNumbers="true" %}
```typescript
import e from "validator";

// Convert a string to int
await e.string().custom(ctx => parseInt(ctx.output)).validate("1.02"); // returns 1

// Encrypt the password
await e.object({
    username: e.string(),
    password: e.string().custom(ctx => {
        // Concat username with password and encrypt
        return encrypt(ctx.parent.output.username + ctx.output);
    }),
});

// Check if the password matches the confirmPassword
await e.object({
    username: e.string(),
    password: e.string(),
    confirmPassword: e.string(),
}).custom(ctx => {
    if(ctx.output.password !== ctx.output.confirmPassword)
        throw new Error("Password does not match!");
});
```
{% endcode %}
