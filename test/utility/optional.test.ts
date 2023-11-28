import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Optional Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Result = await e.optional(e.string()).validate();
    assertEquals(Result, undefined);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = "hi";
    const Result = await e.optional(e.string()).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = 10n;
    const Result = await e.optional(e.string()).default(Target).validate();
    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.optional(e.string()).validate(1);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Optional in object Case 1", async () => {
    const Target = {
      foo: "bar",
      baz: undefined,
    };
    const Result = await e
      .object({
        foo: e.string(),
        baz: e.optional(e.string()),
      })
      .validate(Target);

    assertObjectMatch(Result, Target);
  });

  await ctx.step("Optional in object Case 2", async () => {
    const Target = {
      foo: "bar",
      baz: "foo",
    };
    const Result = await e
      .object({
        foo: e.string(),
        baz: e.optional(e.string()),
      })
      .validate(Target);

    assertObjectMatch(Result, Target);
  });

  await ctx.step("Optional in object Case 3", async () => {
    try {
      await e
        .object({
          foo: e.string(),
          baz: () => e.optional(e.string()),
        })
        .validate({
          foo: "bar",
          baz: 1,
        });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Optional in object Case 4", async () => {
    try {
      await e
        .object({
          foo: e.string(),
          bar: e.string(),
          baz: e.object({
            foo: e.optional(e.number()),
            bar: e.optional(e.string()),
            hello: e.string(),
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
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 4);
    }
  });

  await ctx.step("Termination Check Case 1", async () => {
    try {
      await e
        .object({
          foo: e.string(),
          bar: e.string(),
          baz: e.object({
            bar: e.optional(e.string()),
            foo: e.number({ throwsFatal: true }),
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
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Termination Check Case 2", async () => {
    try {
      await e
        .object({
          foo: e.string(),
          bar: e.string(),
          baz: e.object({
            foo: e.optional(e.number({ throwsFatal: true })),
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
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Termination Check Case 3", async () => {
    try {
      await e
        .object({
          foo: e.string(),
          bar: e.string(),
          baz: e.object({
            foo: e.optional(
              e.number({ throwsFatal: true }).custom(() => {
                throw "This should not be thrown!";
              })
            ),
            bar: e.optional(e.string()),
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
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
