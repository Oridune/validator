import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Number Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Target = 1;
    const Result = await e.number().validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.number().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Casted Validation", async () => {
    const Result = await e.number({ cast: true }).validate("1");
    assertEquals(Result, 1);
  });

  await ctx.step("Min Length Check", async () => {
    try {
      const Target = 1;
      await e
        .number()
        .length({ min: 2 })
        .validate(Target, { name: "length_check" });
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(
        e.issues[0].message,
        "Number is smaller than minimum length!"
      );
    }
  });

  await ctx.step("Max Amount Check", async () => {
    try {
      const Target = 100;
      await e.number().amount(99).validate(Target, { name: "length_check" });
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(
        e.issues[0].message,
        "Number is greater than maximum amount!"
      );
    }
  });

  await ctx.step("Truthy Amount Check", async () => {
    const Target = -1;
    const Results = await e.number().min(-1).max(1).validate(Target);

    assertEquals(Results, Target);
  });

  await ctx.step("Falsy Amount Check", async () => {
    try {
      const Target = -1;
      await e.number().min(0).max(1).validate(Target);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(
        e.issues[0].message,
        "Number is smaller than minimum amount!"
      );
    }
  });

  await ctx.step("Truthy Integer Check", async () => {
    const Target = 100;
    const Results = await e.number().int().validate(Target);

    assertEquals(Results, Target);
  });

  await ctx.step("Falsy Integer Check", async () => {
    try {
      await e.number().int().validate(1.2);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(e.issues[0].message, "Number should be an integer!");
    }
  });

  await ctx.step("Truthy Float Check", async () => {
    const Target = 1.1;
    const Results = await e.number().float().validate(Target);

    assertEquals(Results, Target);
  });

  await ctx.step("Falsy Float Check", async () => {
    try {
      await e.number().float().validate(1);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(e.issues[0].message, "Number should be a float!");
    }
  });
});
