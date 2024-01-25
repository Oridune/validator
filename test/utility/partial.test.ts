import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Partial Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Schema = e.partial(
      e.object({
        username: e.string(),
        password: e.string(),
      })
    );

    const Data = {};
    const Result = await Schema.validate(Data);

    assertObjectMatch(Result, Data);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Schema = e.partial(() =>
      e.object({
        username: () => e.string(),
        password: e.string(),
      })
    );

    const Data = { username: "john", password: "wick" };
    const Result = await Schema.validate(Data);

    assertObjectMatch(Result, Data);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Schema = e.partial(() =>
      e.object({
        username: e.string(),
        password: e.optional(e.string()).default("secret"),
      })
    );

    const Data = { username: "john" };
    const Result = await Schema.validate(Data);

    assertObjectMatch(Result, Data);
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    const Schema = e.partial(
      e.object({
        username: e.string(),
        password: e.optional(e.string()).default("secret"),
      }),
      { overrideOptionalValidator: false }
    );

    const Data = { username: "john" };
    const Result = await Schema.validate(Data);

    assertObjectMatch(Result, { ...Data, password: "secret" });
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      const Schema = e.partial(
        e.object({
          username: e.string(),
          password: e.string(),
        }),
        { ignore: ["username", "password"] }
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
