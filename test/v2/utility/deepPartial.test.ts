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
    const Result = await Schema.validate(Data);

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
    const Result = await Schema.validate(Data);

    assertObjectMatch(Data, Result);

    const Data2 = { profile: { tags: [undefined, "something"] } };
    const Result2 = await Schema.validate(Data2).catch((error) => {
      console.error(error);
      throw error;
    });

    assertObjectMatch(Data2, Result2);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Schema = e.deepPartial(
      () =>
        e.object({
          username: e.optional(e.string()).default("Someone"),
          password: e.string(),
          profile: e.object({
            fullName: e.optional(e.string()).default("Anonymus"),
            dob: e.date(),
          }),
        }),
      { overrideOptionalValidator: false },
    );

    const Data = { profile: {} };
    const Result = await Schema.validate(Data);

    assertObjectMatch(Result, {
      username: "Someone",
      profile: { fullName: "Anonymus" },
    });
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

      await Schema.validate(Data);

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
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
        { ignoreKeys: ["profile.dob"] },
      );

      const Data = { profile: {} };

      await Schema.validate(Data).catch((error) => {
        console.error(error);
        throw error;
      });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 3", async () => {
    try {
      const Schema = e.deepPartial(
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
          ),
        }),
        { ignoreKeys: ["profile.dob", "timeline.metadata"] },
      );

      const Data = { profile: {}, timeline: [{}] };

      await Schema.validate(Data).catch((error) => {
        console.error(error);
        throw error;
      });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 2);
    }
  });

  await ctx.step("Falsy Validation Case 4", async () => {
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
        { ignore: ["timeline"] },
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
