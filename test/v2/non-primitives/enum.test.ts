import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

enum StatusMixed {
  pending,
  processing,
  completed,
}

enum Status {
  pending = "pending",
  processing = "processing",
  completed = "completed",
}

Deno.test("Enum Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation (In) Case 1", async () => {
    const Target = "pending";
    const Result = await e.in(Object.values(StatusMixed)).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation (In) Case 2", async () => {
    const Target = "pending";
    const Result = await e
      .in(() => Object.values(StatusMixed))
      .validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation (Enum)", async () => {
    const Target = "pending";
    const Result = await e.enum(Object.values(Status)).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation (In)", async () => {
    try {
      await e.in(Object.values(StatusMixed)).validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation (Enum)", async () => {
    try {
      await e.enum(Object.values(Status)).validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
