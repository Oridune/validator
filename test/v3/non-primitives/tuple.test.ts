import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Tuple Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target: string[] = [];
    const Result = await e.tuple([]).validate(Target) satisfies [];
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = ["hello"];
    const Result = await e.tuple([e.string()]).validate(Target) satisfies [
      string,
    ];
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = ["foo", "bar", "baz"];
    const Result = await e
      .tuple([e.string(), e.string(), e.string()])
      .validate(Target) satisfies [string, string, string];

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    const Target = ["foo", "bar", undefined];
    const Result = await e
      .tuple([e.string(), e.string(), e.optional(e.string())])
      .length({ min: 3, max: 3 })
      .validate(Target) satisfies [string, string, string | undefined];

    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      await e.tuple([]).validate("hi") satisfies [];
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
    try {
      await e.tuple([e.string(), e.string(), e.string()]).validate([
        1,
        2,
        3,
      ]) satisfies [string, string, string];
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 3);
    }
  });

  await ctx.step("Tuple of Object", async () => {
    const Target = [{ foo: "bar" }, { bar: "buzz" }];
    const Result = await e
      .tuple([
        e.object({ foo: e.string() }),
        e.object({ bar: e.string() }),
      ])
      .validate(Target) satisfies [{ foo: string }, { bar: string }];

    assertEquals(JSON.stringify(Result), JSON.stringify(Target));
  });

  await ctx.step(
    "Falsy Tuple of Object (Termination on unexpected field)",
    async () => {
      try {
        await e
          .tuple([e.object({ foo: e.string() })])
          .validate([{ foo: 1 }, { bar: "baz" }]) satisfies [{ foo: string }];

        throw new Error(`Validation Invalid!`);
      } catch (e) {
        assertInstanceOf(e, ValidationException);
        assertEquals(e.issues.length, 1);
      }
    },
  );

  await ctx.step("Falsy Tuple of Object (Manual Termination)", async () => {
    try {
      await e
        .tuple([e.object({ foo: e.string({ throwsFatal: true }) })])
        .validate([{ foo: 1 }]) satisfies [{ foo: string }];

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
