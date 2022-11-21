import e, { ValidationException } from "../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
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
      RawUser.followers,
    );
    assertEquals(
      await e.object({}, { strict: false }).validate(RawUser),
      RawUser,
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
});
