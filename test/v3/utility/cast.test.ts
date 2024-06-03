import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Cast Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target = "100";
    const Result = await e.cast(e.number()).validate(Target) satisfies number;
    assertEquals(Result, 100);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = '{"foo": "string"}';
    const Result = await e.cast(e.object({ foo: e.string() })).validate(
      Target,
    ) satisfies { foo: string };

    assertEquals(Result, { foo: "string" });
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      const Target = '{"foo": "100"}';
      await e.cast(e.object({ foo: e.number() })).validate(
        Target,
      ) satisfies { foo: number };

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
    try {
      const Target = '["100", 200]';
      await e.cast(e.array(e.number())).validate(
        Target,
      ).catch((error) => {
        console.error(error);
        throw error;
      }) satisfies Array<number>;

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
