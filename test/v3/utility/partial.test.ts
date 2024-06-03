// deno-lint-ignore-file no-explicit-any
import e, { ValidationException } from "../target.ts";
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
      }),
    );

    const Data = {};
    const Result = await Schema.validate(Data) satisfies {
      username?: string;
      password?: string;
    };

    assertObjectMatch(Result, Data);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Schema = e.partial(e.object({
      username: e.string(),
      password: e.string(),
    }));

    const Data = { username: "john", password: "wick" };
    const Result = await Schema.validate(Data) satisfies {
      username?: string;
      password?: string;
    };

    assertObjectMatch(Result, Data);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Schema = e.partial(e.object({
      username: e.string(),
      password: e.optional(e.string()).default("secret"),
    }));

    const Data = { username: "john" };
    const Result = await Schema.validate(Data) satisfies {
      username?: string;
      password?: string;
    };

    assertObjectMatch(Result, Data);
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    const Schema = e.partial(
      e.object({
        username: e.string(),
        password: e.optional(e.string()).default("secret"),
      }),
    );

    const Data = { username: "john" };
    const Result = await Schema.validate(Data) satisfies {
      username?: string;
      password?: string;
    };

    assertObjectMatch(Result, { ...Data, password: "secret" });
  });

  await ctx.step("Truthy Validation Case 5", async () => {
    const Schema = e.partial(e.array(e.string()));

    const Data = ["foo", undefined];
    const Result = await Schema.validate(Data) satisfies (string | undefined)[];

    assertObjectMatch(Result, Data as any);
  });

  await ctx.step("Truthy Validation Case 6", async () => {
    const Schema = e.partial(e.tuple([e.string(), e.number()]));

    const Data = ["foo", 1] as const;
    const Result = await Schema.validate(Data).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies [
      (string | undefined)?,
      (number | undefined)?,
    ];

    assertObjectMatch(Result, Data as any);
  });

  await ctx.step("Truthy Validation Case 7", async () => {
    const Schema = e.partial(e.record(e.number()));

    const Data = {};
    const Result = await Schema.validate(Data).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies Record<string, number | undefined>;

    assertObjectMatch(Result, Data);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      const Schema = e.partial(
        e.object({
          username: e.string(),
          password: e.string(),
          timeline: e.array(
            e.object({
              event: e.string(),
              metadata: e.object({
                foo: e.string(),
              }),
            }),
          ),
        }),
      );

      const Data = { timeline: [{}] };

      await Schema.validate(Data) satisfies {
        username?: string;
        password?: string;
        timeline?: Array<{
          event: string;
          metadata: {
            foo: string;
          };
        }>;
      };

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 2);
    }
  });
});
