import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Object Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    try {
      const Target = {};
      const Result = await e.object().validate(Target);
      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.object().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Unexpected Fields", async () => {
    try {
      await e.object().validate({
        foo: "bar",
        hello: "world",
      });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(e.issues[0].location, "input.foo");
    }
  });

  await ctx.step("Unexpected Field", async () => {
    try {
      await e
        .object({
          foo: e.string(),
        })
        .validate({
          foo: "bar",
          hello: "world",
        });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(
        e.issues[0].message,
        "Unexpected property has been encountered!"
      );
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Allow Unexpected Fields", async () => {
    try {
      const Target = {
        foo: "bar",
        bar: "baz",
        hello: "world",
      };

      const Result = await e
        .object({ foo: e.string() }, { allowUnexpectedProps: true })
        .validate(Target);

      assertObjectMatch(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Allow Specific Unexpected Fields", async () => {
    try {
      await e
        .object({ foo: e.string() }, { allowUnexpectedProps: ["bar"] })
        .validate({
          foo: "bar",
          bar: "baz",
          hello: "world",
        });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(
        e.issues[0].message,
        "Unexpected property has been encountered!"
      );
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Output chain check", async () => {
    try {
      const Target = {
        foo: "bar",
        bar: "baz",
        hello: "world",
      };

      const Target2 = {
        ...Target,
        bar: "buzz",
      };

      const Result = await e
        .object({
          foo: e.string(),
          bar: e
            .string()
            .custom((ctx) => {
              assertEquals(ctx.input, Target.bar);
              assertEquals(ctx.output, Target.bar);
              ctx.output = "buzz";
            })
            .custom((ctx) => {
              assertEquals(ctx.input, Target.bar);
              assertEquals(ctx.output, "buzz");
            }),
          hello: e.string().custom((ctx) => {
            assertEquals(ctx.input, Target.hello);
            assertEquals(ctx.output, Target.hello);
            assertObjectMatch(ctx.parent?.input, Target);
            assertObjectMatch(ctx.parent?.output, Target2);
          }),
        })
        .custom((ctx) => {
          assertEquals(ctx.input, Target);
          assertEquals(ctx.output, Target2);
        })
        .validate(Target);

      assertObjectMatch(Result, Target2);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Termination Check Case 1", async () => {
    try {
      await e
        .object({
          foo: e.number(),
          bar: e.number(),
          baz: e
            .boolean({ throwsFatal: true })
            .custom(() => {
              throw "Another error!";
            })
            .custom(() => {
              throw "Another one!";
            }),
          hello: e.number(),
          hola: e.bigint(),
        })
        .validate({
          foo: "bar",
          bar: "baz",
          baz: "foo",
          hello: "world",
        });

      // throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 3);
    }
  });

  await ctx.step("Termination Check Case 2", async () => {
    try {
      await e
        .object(
          {
            foo: e.string(),
            bar: e.string(),
            baz: e
              .string()
              .custom(() => {
                throw "Another error!";
              })
              .custom(() => {
                throw "Another one!";
              }),
            hello: e.number(),
            hola: e.bigint(),
          },
          { throwsFatal: true }
        )
        .validate({
          foo: "bar",
          bar: "baz",
          baz: "foo",
          hello: "world",
        });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.isFatal, true);
      assertEquals(e.issues.length, 4);
    }
  });

  await ctx.step("Termination Check Case 3", async () => {
    try {
      await e
        .object({
          foo: e.string(),
          bar: e.string(),
          baz: e.object(
            { foo: e.number(), bar: e.string() },
            { throwsFatal: true }
          ),
          hello: e.number(),
          hola: e.bigint(),
        })
        .validate({
          foo: "bar",
          bar: "baz",
          baz: {
            foo: "bar",
          },
          hello: "world",
        });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 2);
    }
  });

  await ctx.step("Termination Check Case 4", async () => {
    try {
      await e
        .object({
          foo: e.string(),
          bar: e.string(),
          baz: e.object({
            foo: e.number({ throwsFatal: true }),
            bar: e.string(),
          }),
          hello: e.number(),
          hola: e.bigint(),
        })
        .validate({
          foo: "bar",
          bar: "baz",
          baz: {
            foo: "bar",
          },
          hello: "world",
        });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Termination Check Case 5", async () => {
    try {
      await e
        .object(
          {
            foo: e.string(),
            bar: e.string(),
            baz: e
              .string()
              .custom((ctx) => {
                ctx.throwsFatal();
                throw "Another error!";
              })
              .custom(() => {
                throw "Another one!";
              }),
            hello: e.number(),
            hola: e.bigint(),
          },
          { throwsFatal: true }
        )
        .validate({
          foo: "bar",
          bar: "baz",
          baz: "foo",
          hello: "world",
        });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.isFatal, true);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Termination Check Case 6", async () => {
    try {
      await e
        .object(
          {
            foo: e.number(),
            bar: e.string(),
            baz: e
              .string()
              .custom((ctx) => {
                ctx.throwsFatal();
                throw "Another error!";
              })
              .custom(() => {
                throw "Another one!";
              }),
            hello: e.number(),
            hola: e.bigint(),
          },
          { throwsFatal: true }
        )
        .validate({
          foo: "bar",
          bar: "baz",
          baz: "foo",
          hello: "world",
        });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.isFatal, true);
      assertEquals(e.issues.length, 2);
    }
  });
});
