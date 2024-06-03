import e from "../target.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Or Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target = "100";
    const Result = await e.or([e.string(), e.number()]).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = "100";
    const Result = await e
      .or([() => e.string(), () => e.number()])
      .validate(Target);
    assertEquals(Result, Target);
  });
});
