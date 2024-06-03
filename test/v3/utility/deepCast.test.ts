import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Deep Cast Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target = "100";
    const Result = await e.deepCast(e.number()).validate(
      Target,
    ) satisfies number;

    assertEquals(Result, 100);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = '{"foo": "100"}';
    const Result = await e.deepCast(e.object({ foo: e.number() })).validate(
      Target,
    ) satisfies { foo: number };

    assertEquals(Result, { foo: 100 });
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = '{"foo": 100}';
    const Result = await e.deepCast(e.object({ foo: e.number() })).validate(
      Target,
    ) satisfies { foo: number };

    assertEquals(Result, { foo: 100 });
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    const Target = '["100", 200]';
    const Result = await e.deepCast(e.array(e.number())).validate(
      Target,
    ).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies Array<number>;

    assertEquals(Result, [100, 200]);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      const Target = "{}";
      await e.deepCast(e.object({ foo: e.number() })).validate(
        Target,
      ) satisfies { foo: number };

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
