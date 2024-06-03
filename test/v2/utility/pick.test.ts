import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Pick Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Schema = e.pick(
      e.object({
        username: e.string(),
        password: e.string(),
      }),
      { keys: ["password"] },
    );

    const Data = { password: "john" };
    const Result = await Schema.validate(Data);

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Schema = e.pick(() =>
      e.object({
        username: () => e.string(),
        password: e.string(),
      })
    );

    const Data = {};
    const Result = await Schema.validate(Data);

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      const Schema = e.pick(
        e.object({
          username: e.string(),
          password: e.string(),
        }),
        { keys: ["password"] },
      );

      const Data = { username: "john", password: "wick" };

      await Schema.validate(Data);

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
