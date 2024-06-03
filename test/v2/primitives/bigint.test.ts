import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("BigInt Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Target = 1n;
    const Result = await e.bigint().validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.bigint().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Message Validation", async () => {
    const ErrorMessage = "Oops!";

    try {
      await e
        .bigint({
          messages: {
            typeError: () => ErrorMessage,
          },
        })
        .validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      console.error(e);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(e.issues[0].message, ErrorMessage);
    }
  });
});
