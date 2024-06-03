// deno-lint-ignore-file no-explicit-any
import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Optional Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Result = await e.optional(e.string()).validate() satisfies
      | string
      | undefined;

    assertEquals(Result, undefined);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = "hi";
    const Result = await e.optional(e.string()).validate(Target) satisfies
      | string
      | undefined;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = 10n;
    const Result = await e.optional(e.string()).default(Target)
      .validate() satisfies string | bigint;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    const Result = await e.optional(e.array().min(1)).validate() satisfies
      | any[]
      | undefined;

    assertEquals(Result, undefined);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.optional(e.string()).validate(1) satisfies string | undefined;
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
      .validate(Target) satisfies { foo: string; baz?: string };

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
      .validate(Target) satisfies { foo: string; baz?: string };

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
        }) satisfies { foo: string; baz?: string };

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
        }) satisfies {
          foo: string;
          bar: string;
          baz: {
            foo?: number;
            bar?: string;
            hello: string;
          };
          hello: number;
          hola: bigint;
        };

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
        }) satisfies {
          foo: string;
          bar: string;
          baz: {
            bar?: string;
            foo: number;
          };
          hello: number;
          hola: bigint;
        };

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
        }) satisfies {
          foo: string;
          bar: string;
          baz: {
            foo?: number;
            bar: string;
          };
          hello: number;
          hola: bigint;
        };

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
              }),
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
        }) satisfies {
          foo: string;
          bar: string;
          baz: {
            foo?: never;
            bar?: string;
          };
          hello: number;
          hola: bigint;
        };

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
