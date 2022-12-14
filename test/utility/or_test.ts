import e, { ValidationException } from "../../mod.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Or Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    try {
      const Target = "100";
      const Result = await e.or([e.string(), e.number()]).validate(Target);
      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });
});
