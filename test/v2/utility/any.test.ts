import e from "../target.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Any Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Target = 1n;
    const Result = await e.any().validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Default Value", async () => {
    const Target = 100;
    const Result = await e.value(Target).validate();
    assertEquals(Result, Target);
  });
});
