import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Number Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    try {
      const Target = 1;
      const Result = await e.number().validate(Target);
      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.number().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Casted Validation", async () => {
    try {
      const Result = await e.number({ cast: true }).validate("1");
      assertEquals(Result, 1);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
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

  await ctx.step("Truthy Integer Check", async () => {
    try {
      const Target = 100;
      const Results = await e.number().int().validate(Target);

      assertEquals(Results, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
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
    try {
      const Target = 1.1;
      const Results = await e.number().float().validate(Target);

      assertEquals(Results, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
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
