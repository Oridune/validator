import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("BigInt Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    try {
      const Target = 1n;
      const Result = await e.bigint().validate(Target);
      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.bigint().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
