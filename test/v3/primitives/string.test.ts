import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("String Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Target = "";
    const Result = await e.string().validate(Target) satisfies string;
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation", async () => {
    const Target = "";
    const Result = await e.string({
      optional: true,
      optionalOptions: { falsy: true },
    })
      .validate(
        Target,
      ) satisfies string;

    assertEquals(Result, undefined);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.string().validate(1) satisfies string;
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Casted Validation", async () => {
    const Result = await e.string({ cast: true }).validate(1) satisfies string;
    assertEquals(Result, "1");
  });

  await ctx.step("Truty Pattern Validation", async () => {
    const Target = "test@gmail.com";
    const Result = await e
      .string()
      .matches(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,63})$/)
      .validate(Target) satisfies string;

    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Pattern Validation", async () => {
    try {
      await e
        .string()
        .matches(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,63})$/)
        .validate("testatgmail.com") satisfies string;
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
    }
  });

  await ctx.step("Truthy Choice Validation", async () => {
    enum OrderType {
      PENDING = "pending",
      COMPLETED = "completed",
      CANCELLED = "cancelled",
    }

    const Target = "pending";
    const Result = await e
      .string()
      .in(Object.values(OrderType))
      .validate(Target) satisfies OrderType;

    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Choice Validation", async () => {
    try {
      const Target = "processing";
      const Result = await e
        .string()
        .in(["pending", "completed", "cancelled"])
        .validate(Target) satisfies "pending" | "completed" | "cancelled";

      assertEquals(Result, Target);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
    }
  });

  await ctx.step("Min Length Check", async () => {
    try {
      const Target = "";
      await e
        .string()
        .length({ min: 1 })
        .validate(Target, { name: "length_check" }) satisfies string;

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(e.issues[0].input, "");
      assertEquals(e.issues[0].output, "");
      assertEquals(e.issues[0].name, "length_check");
      assertEquals(e.issues[0].location, "length_check");
      assertEquals(
        e.issues[0].message,
        "String is smaller than minimum length!",
      );
    }
  });

  await ctx.step("Validator Chain", async () => {
    const NewValue = "Hello";

    const Result = await e
      .string()
      .length({ max: 0 })
      .custom((ctx) => (ctx.output = NewValue))
      .custom((ctx) => assertEquals(ctx.output, NewValue))
      .validate("") satisfies string;

    assertEquals(Result, NewValue);
  });

  await ctx.step("string.isURL Truthy Validation Case 1", async () => {
    const Value = "http://google.com/";

    const Result = await e
      .string()
      .isURL()
      .min(Value.length)
      .max(Value.length)
      .validate(Value)
      .catch((error) => {
        console.error(error);
        throw error;
      }) satisfies string;

    assertEquals(Result, Value);
  });

  await ctx.step("string.isURL Truthy Validation Case 2", async () => {
    const Value = "http://google.com/";

    const Result = await e
      .string()
      .isURL(true)
      .min(Value.length)
      .max(Value.length)
      .validate(Value) satisfies URL;

    assertInstanceOf(Result, URL);
  });

  await ctx.step("string.isURL Falsy Validation Case 1", async () => {
    try {
      await e.string().isURL().validate("Something") satisfies string;

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("string.isURL Falsy Validation Case 2", async () => {
    try {
      await e.string().isURL(true).validate("Something") satisfies URL;
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Termination Case 1", async () => {
    try {
      await e
        .string()
        .length({ max: 0 })
        .custom(() => {
          throw new Error(`Should not Terminate here!`);
        })
        .custom(() => {
          throw new Error(`Test Error Occured!`);
        })
        .validate("") satisfies string;

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 2);
    }
  });

  await ctx.step("Termination Case 2", async () => {
    try {
      await e
        .string()
        .length({ max: 0 })
        .custom((ctx) => {
          ctx.throwsFatal();
          throw new Error(`Should Terminate here!`);
        })
        .custom(() => {
          throw new Error(`Test Error Occured!`);
        })
        .validate("") satisfies string;

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Should not be number like", async () => {
    try {
      await e.string().isNaN().validate("123") satisfies string;

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(e.issues[0].message, "String should not be number like!");
    }
  });

  await ctx.step("Should be number like", async () => {
    try {
      await e.string().notIsNaN().custom((ctx) => parseInt(ctx.output))
        .validate("abc") satisfies number;

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
      assertEquals(e.issues[0].message, "String should be number like!");
    }
  });
});
