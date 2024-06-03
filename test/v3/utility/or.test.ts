// deno-lint-ignore-file no-explicit-any
import e from "../target.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Or Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target = "100";
    const Result = await e.or([e.string(), e.number()]).validate(
      Target,
    ) satisfies string | number;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = "100";
    const Result = await e
      .or([() => e.string(), () => e.number()])
      .validate(Target) satisfies any;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = "{}";
    const Result = await e.deepCast(e.or([e.string(), e.object()]))
      .validate(Target) satisfies string | object;

    assertEquals(Result, {});
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    const Target = {};
    const Result = await e.deepCast(
      e.or([e.string(), e.object()], { disableValidatorSorting: true }),
    )
      .validate(Target) satisfies string | object;

    assertEquals(Result, "[object Object]");
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = "{}";
    const Result = await e.deepCast(
      e.or([e.string(), e.object()], { disableValidatorSorting: true }),
    )
      .validate(Target) satisfies string | object;

    assertEquals(Result, Target);
  });
});
