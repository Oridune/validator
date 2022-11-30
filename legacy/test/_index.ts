import e, { ValidationException } from "../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Validator Tests", async (t) => {
  const RawUser = {
    name: "John",
    age: 18,
    active: true,
    metadata: {
      gender: "male",
    },
    followers: [
      {
        name: "David",
        age: "15",
      },
      {
        name: "Frank",
        age: 16,
      },
    ],
  };

  await t.step("Test Validators", async () => {
    assertEquals(await e.optional(e.string()).validate(undefined), undefined);
    assertEquals(await e.any().validate(""), "");
    assertEquals(await e.string().validate(""), "");
    assertEquals(await e.in(["a", "b", "c"]).validate("b"), "b");
    assertEquals(await e.number().validate(1), 1);
    assertEquals(await e.boolean().validate(true), true);
    assertEquals(
      await e.array().validate(RawUser.followers),
      RawUser.followers
    );
    assertEquals(
      await e
        .object(
          {},
          {
            allowUnexpectedProps: [
              "name",
              "age",
              "active",
              "metadata",
              "followers",
            ],
          }
        )
        .validate(RawUser),
      RawUser
    );
  });

  await t.step("Unexpected fields", async () => {
    try {
      await e.object().validate(RawUser);
    } catch (err) {
      console.log(err);
      if (err instanceof ValidationException) {
        assertInstanceOf(err.issues, Array);
        assertEquals(err.issues.length, 1);
      } else throw err;
    }
  });

  await t.step("Check inline output", async () => {
    try {
      const Validator = e
        .object({
          type: e.optional(e.enum(["a", "b"])).default((ctx) => {
            assertObjectMatch(ctx.output, { list: [] });
            return "b";
          }),
          command: e.optional(e.string()).default((ctx) => {
            assertObjectMatch(ctx.output, { type: "b" });
            return "test";
          }),
          list: e.array(e.string()),
        })
        .custom((_, ctx) => {
          assertObjectMatch(ctx.output, {
            type: "b",
            command: "test",
          });
        });

      await Validator.validate({ list: [] });
    } catch (err) {
      console.log(err.issues);
      throw err;
    }
  });
});
