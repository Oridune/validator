---
description: Let's see how the validator works!
---

# Basic Usage

As mentioned in the [getting started page](./) Oridune validator is mostly similar to Zod. You compose smaller chunks of validators into a validations schema. See the following example:

#### Create a simple validator

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

#### Create an object Schema

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

