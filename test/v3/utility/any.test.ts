// deno-lint-ignore-file no-explicit-any
import e from "../target.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Any Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Target = 1n;
    const Result = await e.any().validate(Target) satisfies any;
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation", async () => {
    const Target = 1n;
    const Result = await e.any().custom(() => "something").validate(
      Target,
    ) satisfies string;

    assertEquals(Result, "something");
  });

  await ctx.step("Default Value", async () => {
    const Target = 100;
    const Result = await e.value(Target).validate() satisfies number;
    assertEquals(Result, Target);
  });
});
