import e, { ValidationException } from "../../mod.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("And Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    try {
      const Target = "100";
      const Result = await e
        .and([e.string(), e.number({ cast: true })])
        .validate(Target);
      assertEquals(Result.toString(), Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });
});
