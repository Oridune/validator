// deno-lint-ignore-file no-explicit-any
import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Deep-Partial Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Schema = e.deepPartial(
      e.object({
        username: e.string(),
        password: e.string(),
        profile: e.object({
          fullName: e.string(),
          dob: e.date(),
        }),
      }),
    );

    const Data = {};
    const Result = await Schema.validate(Data) satisfies {
      username?: string;
      password?: string;
      profile?: {
        fullName?: string;
        dob?: Date;
      };
    };

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Schema = e.deepPartial(
      e.object({
        username: e.string(),
        password: e.string(),
        profile: e.object({
          fullName: e.optional(e.string()).default("Anonymus"),
          dob: e.date(),
          tags: e.array(e.string()),
        }),
      }),
    );

    const Data = { username: "Someone" };
    const Result = await Schema.validate(Data) satisfies {
      username?: string;
      password?: string;
      profile?: {
        fullName?: string;
        dob?: Date;
      };
    };

    assertObjectMatch(Data, Result);

    const Data2 = {
      profile: { fullName: "Anonymus", tags: [undefined, "something"] },
    };
    const Result2 = await Schema.validate(Data2).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies {
      username?: string;
      password?: string;
      profile?: {
        fullName?: string;
        dob?: Date;
      };
    };

    assertObjectMatch(Data2, Result2);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Schema = e.deepPartial(
      e.object({
        username: e.optional(e.string()).default("Someone"),
        password: e.string(),
        profile: e.object({
          fullName: e.optional(e.string()).default("Anonymus"),
          dob: e.date(),
        }),
      }),
    );

    const Data = { profile: {} };
    const Result = await Schema.validate(Data).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies {
      username?: string;
      password?: string;
      profile?: {
        fullName?: string;
        dob?: Date;
      };
    };

    assertObjectMatch(Result, {
      username: "Someone",
      profile: { fullName: "Anonymus" },
    });
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    const Schema = e.deepPartial(
      e.object({
        username: e.optional(e.string()).default("Someone"),
        password: e.string(),
        profile: e.object({
          fullName: e.optional(e.string()).default("Anonymus"),
          dob: e.date(),
        }),
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

    const Data = { profile: {} };
    const Result = await Schema.validate(Data).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies {
      username?: string;
      password?: string;
      profile?: {
        fullName?: string;
        dob?: Date;
      };
      timeline?: Array<
        {
          event?: string;
          metadata?: {
            foo?: string;
          };
        } | undefined
      >;
    };

    assertObjectMatch(Result, {
      username: "Someone",
      profile: { fullName: "Anonymus" },
    });
  });

  await ctx.step("Truthy Validation Case 5", async () => {
    const Schema = e.deepPartial(
      e.object({
        username: e.optional(e.string()).default("Someone"),
        password: e.string(),
        profile: e.object({
          fullName: e.optional(e.string()).default("Anonymus"),
          dob: e.date(),
        }),
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

    const Data = { profile: {} };
    const Result = await Schema.validate(Data).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies {
      username?: string;
      password?: string;
      profile?: {
        fullName?: string;
        dob?: Date;
      };
      timeline?: Array<
        {
          event?: string;
          metadata?: {
            foo?: string;
          };
        } | undefined
      >;
    };

    assertObjectMatch(Result, {
      username: "Someone",
      profile: { fullName: "Anonymus" },
    });
  });

  await ctx.step("Truthy Validation Case 6", async () => {
    const Schema = e.deepPartial(
      e.object({
        username: e.optional(e.string()).default("Someone"),
        password: e.string(),
        profile: e.object({
          fullName: e.optional(e.string()).default("Anonymus"),
          dob: e.date(),
        }),
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

    const Data = { profile: {}, timeline: [{ event: "something" }] };
    const Result = await Schema.validate(Data).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies {
      username?: string;
      password?: string;
      profile?: {
        fullName?: string;
        dob?: Date;
      };
      timeline?: Array<
        {
          event?: string;
          metadata?: {
            foo?: string;
          };
        } | undefined
      >;
    };

    assertObjectMatch(Result, {
      username: "Someone",
      profile: { fullName: "Anonymus" },
    });
  });

  await ctx.step("Truthy Validation Case 7", async () => {
    const Schema = e.deepPartial(
      e.object({
        username: e.optional(e.string()).default("Someone"),
        password: e.string(),
        profile: e.object({
          fullName: e.optional(e.string()).default("Anonymus"),
          dob: e.date(),
        }),
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

    const Data = { profile: {}, timeline: [{ metadata: {} }] };
    const Result = await Schema.validate(Data).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies {
      username?: string;
      password?: string;
      profile?: {
        fullName?: string;
        dob?: Date;
      };
      timeline?: Array<
        {
          event?: string;
          metadata?: {
            foo?: string;
          };
        } | undefined
      >;
    };

    assertObjectMatch(Result, {
      username: "Someone",
      profile: { fullName: "Anonymus" },
    });
  });

  await ctx.step("Truthy Validation Case 8", async () => {
    const Schema = e.deepPartial(e.array(
      e.object({
        event: e.string(),
        metadata: e.object({
          foo: e.string(),
        }),
      }),
    ));

    const Data: any = [{}];
    const Result = await Schema.validate(Data).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies Array<
      {
        event?: string;
        metadata?: {
          foo?: string;
        };
      } | undefined
    >;

    assertObjectMatch(Result, Data);
  });

  await ctx.step("Truthy Validation Case 9", async () => {
    const Schema = e.deepPartial(e.record(e.number()));

    const Data: any = { foo: undefined };
    const Result = await Schema.validate(Data).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies Record<string, number | undefined>;

    assertObjectMatch(Result, Data);
  });

  await ctx.step("Truthy Validation Case 10", async () => {
    const Schema = e.deepPartial(
      e.object({
        username: e.string(),
        password: e.string(),
        profile: e.object({
          fullName: e.optional(e.string()).default("Anonymous"),
          dob: e.date(),
        }),
      }),
      { noDefaults: true },
    );

    const Data = { profile: {} };
    const Result = await Schema.validate(Data) satisfies {
      username?: string;
      password?: string;
      profile?: {
        fullName?: string;
        dob?: Date;
      };
    };

    if (Result.profile?.fullName) throw new Error("No fullName");

    assertObjectMatch(Data, Result);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      const Schema = e.deepPartial(
        e.object({
          username: e.string(),
          password: e.string(),
          profile: e.object({
            fullName: e.string(),
            dob: e.date(),
          }),
        }),
      );

      const Data = { username: "Someone", foo: "bar" };

      await Schema.validate(Data) satisfies {
        username?: string;
        password?: string;
        profile?: {
          fullName?: string;
          dob?: Date;
        };
      };

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
    try {
      const Schema = e.partial(
        e.object({
          username: e.string(),
          password: e.string(),
          profile: e.object({
            fullName: e.string(),
            dob: e.date(),
          }),
          timeline: e.array(
            e.object({
              event: e.string(),
              metadata: e.object({
                foo: e.string(),
              }),
            }),
            {
              cast: true,
              ignoreNanKeys: true,
              pushNanKeys: true,
            },
          ),
        }),
        ["timeline"],
      );

      const Data = {
        timeline: {
          $: {},
        },
      };

      await Schema.validate(Data)
        .then(console.log)
        .catch((error) => {
          console.error(error);
          throw error;
        });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 2);
    }
  });
});
