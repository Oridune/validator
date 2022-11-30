import e, { ValidationException } from "../../mod.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Any Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    try {
      const Target = 1n;
      const Result = await e.any().validate(Target);
      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Default Value", async () => {
    try {
      const Target = 100;
      const Result = await e.value(Target).validate();
      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });
});
