import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Boolean Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Target = true;
    const Result = await e.boolean().validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.boolean().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Casted Validation", async () => {
    const Result = await e.boolean({ cast: true }).validate("1");
    assertEquals(Result, true);
  });

  await ctx.step("Expectation", async () => {
    try {
      await e.boolean({ cast: true, expected: false }).validate("1");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
