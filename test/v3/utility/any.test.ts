// deno-lint-ignore-file no-explicit-any
import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Any Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Target = 1n;
    const Result = await e.any().validate(Target) satisfies any;
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation", async () => {
    const Target = 1n;
    const Result = await e.any().custom(() => "something").validate(
      Target,
    ) satisfies string;

    assertEquals(Result, "something");
  });

  await ctx.step("Default Value", async () => {
    const Target = 100;
    const Result = await e.value(Target).validate() satisfies number;
    assertEquals(Result, Target);
  });

  await ctx.step("Value Schema Validation", () => {
    const Input1 = "foo";

    const Validator1 = e.value(Input1);

    const { schema: s1 } = Validator1.toJSON();

    assertEquals(s1.type, "any");
    assertEquals(s1.tsType, `"foo" | (string & {})`);

    const Input2 = 123;

    const Validator2 = e.value(Input2);

    const { schema: s2 } = Validator2.toJSON();

    assertEquals(s2.tsType, `123 | (number & {})`);
  });

  await ctx.step("Truthy Literal Validation", async () => {
    const Input = "foo";
    const Output = "foo";
    await e.literal("foo").validate(Input) satisfies "foo";
    assertEquals(Input, Output);
  });

  await ctx.step("Falsy Literal Validation", async () => {
    try {
      await e.literal("foo").validate("something") satisfies "foo";
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
