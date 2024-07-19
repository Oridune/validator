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
    const Result = await e.in(Object.values(StatusMixed)).validate(
      Target,
    ) satisfies string | StatusMixed;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation (In) Case 2", async () => {
    const Target = "pending";
    const Result = await e
      .in(() => Object.values(StatusMixed))
      .validate(Target) satisfies StatusMixed | string;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation (Enum)", async () => {
    const Target = "pending";
    const Result = await e.enum(Object.values(Status)).validate(
      Target,
    ) satisfies Status;

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", () => {
    const Schema = e.enum(Object.values(Status));

    assertEquals(Schema.toJSON(), {
      schema: {
        type: "string",
        choices: [
          "pending",
          "processing",
          "completed",
        ],
        description: undefined,
      },
      validator: Schema,
    });
  });

  await ctx.step("Truthy Validation Case 4", () => {
    const Schema = e.enum(Object.values(Status));

    assertEquals(
      Schema.toSample().data,
      [
        "pending",
        "processing",
        "completed",
      ].join("|"),
    );
  });

  await ctx.step("Falsy Validation (In)", async () => {
    try {
      await e.in(Object.values(StatusMixed)).validate("hi") satisfies
        | StatusMixed
        | string;
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation (Enum)", async () => {
    try {
      await e.enum(Object.values(Status)).validate("hi") satisfies Status;
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
