// deno-lint-ignore-file no-explicit-any
import e, { ValidationException } from "../target.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Array Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target: string[] = [];
    const Result = await e.array().validate(Target) satisfies any[];

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target: string[] = [];
    const Validator = () => e.string();
    const Result = await e.array(Validator).validate(Target) satisfies string[];

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = ["foo", "bar", "baz"];
    const Result = await e.array(e.string()).validate(Target).catch((error) => {
      console.error(error);
      throw error;
    }) satisfies string[];

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    const Target = ["foo", "bar", undefined];
    const Result = await e
      .array(e.optional(e.string()))
      .length({ min: 3, max: 3 })
      .validate(Target) satisfies (string | undefined)[];

    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 5", async () => {
    const Target = { 0: "foo", "2": "bar", 5: "baz" };
    const Expected: string[] = [];

    Expected[0] = "foo";
    Expected[2] = "bar";
    Expected[5] = "baz";

    const Validator = e.array(e.or([e.string(), e.undefined()]));

    const Result = await e
      .deepCast(Validator)
      .validate(Target)
      .catch((error) => {
        console.error(error);
        throw error;
      }) satisfies (string | undefined)[];

    assertEquals(Result.length, 6);
  });

  await ctx.step("Truthy Validation Case 6", async () => {
    const Target = null;

    const Result = await e
      .array(e.or([e.null()]), { cast: true })
      .validate(Target)
      .catch((error) => {
        console.error(error);
        throw error;
      }) satisfies null[];

    assertEquals(Result.length, 1);
    assertObjectMatch([Target], [null] as any);
  });

  await ctx.step("Truthy Validation Case 7", async () => {
    const Target = "foo, bar";

    const Result = await e
      .array(e.or([e.string()]), { cast: true, splitter: /\s*,\s*/ })
      .validate(Target)
      .catch((error) => {
        console.error(error);
        throw error;
      }) satisfies string[];

    assertEquals(Result.length, 2);
    assertObjectMatch(Result, ["foo", "bar"] as any);
  });

  await ctx.step("Truthy Validation Case 8", async () => {
    const Target = { 0: "foo", "2": "bar", 5: "baz", foo: "bar" };
    const Expected: string[] = [];

    Expected[0] = "foo";
    Expected[2] = "bar";
    Expected[5] = "baz";

    const Result = await e
      .array(e.or([e.string(), e.undefined()]), {
        cast: true,
        ignoreNanKeys: true,
      })
      .validate(Target)
      .catch((error) => {
        console.error(error);
        throw error;
      }) satisfies (string | undefined)[];

    assertEquals(Result.length, 6);
  });

  await ctx.step("Truthy Validation Case 9", async () => {
    const Target = { 0: "foo", "2": "bar", 5: "baz", foo: "bar" };

    const Result = await e
      .array(e.record(e.string), {
        cast: true,
      })
      .validate(Target)
      .catch((error) => {
        console.error(error);
        throw error;
      }) satisfies (Record<any, unknown>)[];

    assertEquals(Result.length, 1);
  });

  await ctx.step("Truthy Validation Case 10", async () => {
    const Target = { 0: "foo", "2": "bar", 5: "baz", foo: "bar" };

    const Result = await e
      .array(e.record(e.string()), {
        cast: true,
      })
      .validate(Target)
      .catch((error) => {
        console.error(error);
        throw error;
      }) satisfies (Record<any, string>)[];

    assertEquals(Result.length, 1);
  });

  await ctx.step("Truthy Validation Case 11", async () => {
    const Target = { 0: "foo", "1": "bar", 2: "baz", foo: "bar" };

    const Result = await e
      .array(() => e.string(), {
        cast: true,
        ignoreNanKeys: true,
        pushNanKeys: true,
      })
      .validate(Target)
      .catch((error) => {
        console.error(error);
        throw error;
      }) satisfies string[];

    assertObjectMatch(Result, ["foo", "bar", "baz", "bar"] as any);
  });

  await ctx.step("Truthy Validation Case 12", async () => {
    const Target = { 0: "foo", "1": "bar", 2: "baz", foo: "bar" };

    const Result = await e
      .array(e.string(), { cast: true, ignoreNanKeys: true, pushNanKeys: true })
      .validate(Target)
      .catch((error) => {
        console.error(error);
        throw error;
      }) satisfies string[];

    assertObjectMatch(Result, ["foo", "bar", "baz", "bar"] as any);
  });

  await ctx.step("Truthy Validation Case 13", () => {
    const Schema = e.optional(
      e.cast(
        e.array(e.string(), {
          ignoreNanKeys: true,
          pushNanKeys: true,
        }),
      ),
    );

    assertObjectMatch(Schema.toJSON(), {
      schema: {
        type: "array",
        optional: true,
        cast: true,
        items: {
          type: "string",
        },
      },
    });
  });

  await ctx.step("Truthy Validation Case 14", () => {
    const Schema = e.optional(
      e.deepCast(
        e.array(e.string(), {
          ignoreNanKeys: true,
          pushNanKeys: true,
        }),
      ),
    );

    assertObjectMatch(Schema.toJSON(), {
      schema: {
        type: "array",
        optional: true,
        cast: true,
        items: {
          type: "string",
          cast: true,
        },
      },
    });
  });

  await ctx.step("Truthy Validation Case 15", () => {
    const Schema = e.optional(
      e.deepCast(
        e.array(e.string()),
      ),
    );

    const Sample = Schema.toSample();

    if (
      !(Sample.data.value instanceof Array && 0 in Sample.data &&
        Sample.data[0].valueOf() === "")
    ) throw new Error("Unexpected sample results!");
  });

  await ctx.step("Truthy Validation Case 16", async () => {
    const Target = "[1]";
    const Schema = e.optional(
      e.deepCast(
        e.array(e.string()),
      ),
    ).toStatic();

    const Result = await Schema.validate(Target);

    assertObjectMatch(Result!, ["1"] as any);
  });

  await ctx.step("Truthy Validation Case 17", async () => {
    const Target = { "foo": "a", "bar": "b", "baz": "c" };
    const Schema = e.array(e.string(), { cast: true, preserveShape: true });

    const Result = await Schema.validate(Target);

    assertObjectMatch(Result, Target);
  });

  await ctx.step("Truthy Validation Case 18", async () => {
    const Target = { foo: { "foo": "a", "bar": "b", "baz": "c" } };
    const Schema = e.deepOptions(
      e.object({
        foo: e.array(
          e.string(),
        ),
      }),
      {
        cast: true,
        preserveShape: true,
      },
    );

    const Result = await Schema.validate(Target);

    assertObjectMatch(Result, Target);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      await e.array().validate("hi") satisfies any[];
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
    try {
      await e.array(e.string()).validate([1, 2, 3]) satisfies string[];
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 3);
    }
  });

  await ctx.step("Falsy Validation Case 3", async () => {
    try {
      await e.array(e.string()).length({ min: 3, max: 3 }).validate([
        1,
        2,
      ]) satisfies string[];
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 4", async () => {
    try {
      await e
        .array(e.string(), { cast: true })
        .validate({
          0: "foo",
          "2": "bar",
          5: "baz",
          foo: "bar",
        }) satisfies string[];

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 5", async () => {
    try {
      await e
        .array(e.string(), { cast: true, noCastSingularToArray: true })
        .validate("string") satisfies string[];

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 6", async () => {
    try {
      await e
        .array(e.string(), { cast: true, noCastSingularToArray: true })
        .validate("foo,bar") satisfies string[];

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Array of Object", async () => {
    const Target = [{ foo: "bar" }, { foo: "baz" }];
    const Result = await e
      .array(e.object({ foo: e.string() }))
      .validate(Target).catch((error) => {
        console.error(error);
        throw error;
      }) satisfies Array<{ foo: string }>;

    assertEquals(JSON.stringify(Result), JSON.stringify(Target));
  });

  await ctx.step(
    "Falsy Array of Object (Termination on unexpected field)",
    async () => {
      try {
        await e
          .array(e.object({ foo: e.string() }))
          .validate([{ foo: 1, baz: "bar" }, { bar: "baz" }]) satisfies {
            foo: string;
          }[];

        throw new Error(`Validation Invalid!`);
      } catch (e) {
        assertInstanceOf(e, ValidationException);
        assertEquals(e.issues.length, 2);
      }
    },
  );

  await ctx.step("Falsy Array of Object (Manual Termination)", async () => {
    try {
      await e
        .array(e.object({ foo: e.string({ throwsFatal: true }) }))
        .validate([{ foo: 1 }, { bar: "baz" }]) satisfies { foo: string }[];

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Array of Object", async () => {
    try {
      await e
        .array(e.object({ foo: e.string({ throwsFatal: true }) }))
        .toStatic()
        .validate([{ foo: 1 }, { bar: "baz" }]) satisfies { foo: string }[];

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
