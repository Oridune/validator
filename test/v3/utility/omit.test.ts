// deno-lint-ignore-file ban-types
import e, { ValidationException } from "../target.ts";
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
      ["password"],
    );

    const Data = { username: "john" };
    const Result = await Schema.validate(Data) satisfies { username: string };

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Schema = e.omit(
      e.object({
        username: e.string(),
        password: e.string(),
      }),
      ["username", "password"],
    );

    const Data = {};
    const Result = await Schema.validate(Data) satisfies {};

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      const Schema = e.omit(
        e.object({
          username: e.string(),
          password: e.string(),
        }),
        ["password"],
      );

      const Data = { username: "john", password: "wick" };

      await Schema.validate(Data) satisfies { username: string };

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
        ["username", "password"],
      );

      const Data = { username: "john", password: "wick" };

      await Schema.validate(Data) satisfies {};

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
