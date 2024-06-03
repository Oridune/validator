import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Boolean Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target = true;
    const Result = await e.boolean().validate(Target) satisfies boolean;
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = true;
    const Result = await e.true().validate(Target) satisfies true;
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = false;
    const Result = await e.false().validate(Target) satisfies false;
    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.boolean().validate("hi") satisfies boolean;
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Casted Validation", async () => {
    const Result = await e.boolean({ cast: true }).validate(
      "1",
    ) satisfies boolean;
    assertEquals(Result, true);
  });

  await ctx.step("Expectation", async () => {
    try {
      await e.boolean({ cast: true, expected: false }).validate(
        "1",
      ) satisfies boolean;
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
