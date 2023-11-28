import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Omit Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Schema = e.omit(
      e.object({
        username: e.string(),
        password: e.string(),
      }),
      { keys: ["password"] }
    );

    const Data = { username: "john" };
    const Result = await Schema.validate(Data);

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Schema = e.omit(
      () =>
        e.object({
          username: e.string(),
          password: e.string(),
        }),
      { keys: ["password"] }
    );

    const Data = { username: "john" };
    const Result = await Schema.validate(Data);

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      const Schema = e.omit(
        e.object({
          username: e.string(),
          password: e.string(),
        }),
        { keys: ["password"] }
      );

      const Data = { username: "john", password: "wick" };

      await Schema.validate(Data);

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
    try {
      const Schema = e.omit(
        e.object({
          username: e.string(),
          password: e.string(),
        }),
        { keys: ["username", "password"] }
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
