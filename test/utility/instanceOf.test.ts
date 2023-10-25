import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("InstanceOf Validator Tests", async (ctx) => {
  class User {
    id = "user";
  }

  const Target = new User();

  await ctx.step("Truthy Validation", async () => {
    const Result = await e.instanceOf(User).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.instanceOf(User).validate(User);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
