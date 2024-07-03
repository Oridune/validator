---
description: Learn about the available options, methods and use cases.
---

# object

## Usage

Following is the simple usage of this validator

```typescript
import e from "validator";

await e.object(
    {}, // Optionally pass shape
    {} // Optionally pass options
)
.validate({}) // returns {}
```

### Options

Following are the available options for this validator

```typescript
interface IObjectValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError" | "unexpectedProperty", TErrorMessage>>;

  /**
   * Partialize the object validator (undefined props will be acceptable)
   *
   * Use e.partial() instead, if working with typescript
   */
  partial?: boolean;

  /**
   * Converts any partialized/optional props to required
   *
   * Use e.required() instead, if working with typescript
   */
  required?: boolean;

  /**
   * Ignore keys to be validated
   *
   * Use e.omit() instead, if working with typescript
   */
  omitKeys?: string[];

  /**
   * Select keys to be validated
   *
   * Use e.pick() instead, if working with typescript
   */
  pickKeys?: string[];

  /** Accept any unexpected props */
  allowUnexpectedProps?: string[] | boolean;

  /** Delete any undefined props */
  deletePropertyIfUndefined?: boolean;
}
```

### Methods

Following are the available methods on this validator

<pre class="language-typescript"><code class="lang-typescript"><strong>// Pass a rest validator that validates unexpected props
</strong><strong>.rest(validator: BaseValidator&#x3C;any, any, any>)
</strong></code></pre>

```typescript
// Extend an object validator
.extends(validator: ObjectValidator<any, any, any>)
```

```typescript
// Make a clone of this object validator (creates a new memory reference)
.clone(validator: ObjectValidator<any, any, any>)
```

### Examples

Read the examples below to understand different use cases

#### Case 1 (Basic usage)

```typescript
// Validate a user schema
const User = {
    username: "saif",
    password: "supersecret",
    isActive: true,
    createdAt: new Date(),
};

const UserSchema = e.object({
    username: e.string(), // Pass other validators in the shape
    password: e.string(),
    isActive: e.boolean(),
    createdAt: e.date(),
});

await UserSchema.validate(User) // returns User
```

#### Case 2 (Unexpected props)

```typescript
// Validate a user schema
const User = {
    username: "saif",
    password: "supersecret",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

// This schema will not accept updatedAt prop
const UserSchemaStrict = e.object({
    username: e.string(),
    password: e.string(),
    isActive: e.boolean(),
    createdAt: e.date(),
}, {
    messages: {
        unexpectedProperty: "Do not pass updatedAt field!"
    }
});

// This schema accepts unexpected props
const UserSchema = e.object({
    username: e.string(),
    password: e.string(),
    isActive: e.boolean(),
    createdAt: e.date(),
}, {
    allowUnexpectedProps: true, // You can also pass ["updatedAt"] to limit it.
});

await UserSchemaStrict.validate(User) // throws ValidationException
await UserSchema.validate(User) // returns User
```

#### Case 3 (With rest validator)

```typescript
// Validate a user schema
const User = {
    username: "saif",
    password: "supersecret",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const UserSchema = e.object({
    username: e.string(), // Pass other validators in the shape
    password: e.string(),
    isActive: e.boolean()
})
.rest(e.date()); // Will allow createdAt & updatedAt to be validated as Date.

await UserSchema.validate(User) // returns User
```

#### Case 4 (Extend another object validator)

```typescript
// Validate a user schema
const User = {
    username: "saif",
    password: "supersecret",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

// Create a base schema
const BaseUserSchema = e.object({
    isActive: e.boolean(),
    createdAt: e.date(),
    updatedAt: e.date(),
});

// Extend base schema to the User schema
const UserSchema = e.object({
    username: e.string(), // Pass other validators in the shape
    password: e.string(),
})
.extends(BaseUserSchema);

await UserSchema.validate(User) // returns User
```

#### Case 5 (With casting)

```typescript
// Validate a JSON string
const Data = '{ "foo": "bar" }';

const DataSchema = e.object({
    foo: e.string()
});

await e.cast(DataSchema)
    .validate(Data) // returns { foo: "bar" }
```
