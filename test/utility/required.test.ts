import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Required Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Schema = e.required(
      e.object({
        username: e.optional(e.string()),
        password: e.optional(e.string()),
      }),
      { ignore: ["username", "password"] }
    );

    const Data = {};
    const Result = await Schema.validate(Data);

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Schema = e.required(() =>
      e.object({
        username: e.optional(e.string()),
        password: () => e.optional(e.string()),
      })
    );

    const Data = { username: "john", password: "wick" };
    const Result = await Schema.validate(Data);

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Schema = e.required(
      e.object({
        username: e.optional(e.string()),
        password: e.optional(e.string()),
      }),
      { ignore: ["password"] }
    );

    const Data = { username: "john" };
    const Result = await Schema.validate(Data);

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      const Schema = e.required(
        e.object({
          username: e.optional(e.string()),
          password: e.optional(e.string()),
        })
      );

      const Data = {};

      await Schema.validate(Data);

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 2);
    }
  });
});
