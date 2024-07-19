import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Date Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target = new Date();
    const Result = await e.date().validate(Target) satisfies Date;
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = new Date();
    const Result = await e.date().toStatic().validate(Target) satisfies Date;
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = new Date();
    const Result = await e.optional(e.date()).toStatic().validate(
      Target,
    ) satisfies Date | undefined;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 4", () => {
    const Schema = e.date();
    assertEquals(Schema.toJSON(), {
      schema: {
        type: "date",
        description: undefined,
        cast: false,
        optional: false,
        startsAt: undefined,
        endsAt: undefined,
      },
      validator: Schema,
    });
  });

  await ctx.step("Truthy Validation Case 5", () => {
    const Schema = e.date();
    assertInstanceOf(Schema.toSample().data, Date);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.date().validate("hi") satisfies Date;
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
