import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("If Validator Tests", async (ctx) => {
  const Target = "100";

  await ctx.step("Truthy Validation Case 1", async () => {
    const Result = await e.if(true).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Result = await e.if((v) => !isNaN(v)).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      await e.if(false).validate(Target);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
    try {
      await e.if((v) => isNaN(v)).validate(Target);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
