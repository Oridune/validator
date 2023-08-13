import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Undefined Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Result = await e.undefined().validate();
    assertEquals(Result, undefined);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.undefined().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
