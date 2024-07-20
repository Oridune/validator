# Oridune Validator

A powerful typescript compatible/zod alternative schema validator.

## Introduction

Oridune validator is a TypeScript-first schema declaration and validation
library like Zod.

Validator is designed to be as developer-friendly as possible. The goal is to
eliminate duplicative type declarations. With Validator, you declare a validator
schema once and it will automatically infer the static TypeScript type. It's
easy to compose simpler types into complex data structures.

- Zero dependencies
- Works in Deno/Node and all modern browsers
- Reusable schema that leverages the validation context to save the memory
- Concise, chainable interface
- Works with plain JavaScript too! You don't need to use TypeScript.

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

See the detailed [docs](https://validator.oridune.com) for implementation details.