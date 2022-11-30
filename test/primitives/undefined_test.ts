import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Undefined Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    try {
      const Result = await e.undefined().validate();
      assertEquals(Result, undefined);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.undefined().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
