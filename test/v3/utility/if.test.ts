// deno-lint-ignore-file no-explicit-any
import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("If Validator Tests", async (ctx) => {
  const Target = "100";

  await ctx.step("Truthy Validation Case 1", async () => {
    const Result = await e.if<typeof Target>(true).validate(
      Target,
    ) satisfies typeof Target;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Result = await e.if((v: any) => !isNaN(v)).validate(
      Target,
    ) satisfies any;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Result = await e.if((v: string) =>
      Promise.resolve<boolean>(!isNaN(v as any))
    )
      .validate(Target) satisfies string;

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
      await e.if((v: any) => isNaN(v)).validate(Target);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
