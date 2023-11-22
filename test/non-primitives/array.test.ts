import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Array Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target: string[] = [];
    const Result = await e.array().validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target: string[] = [];
    const Result = await e.array(e.string()).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = ["foo", "bar", "baz"];
    const Result = await e.array(e.string()).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    const Target = ["foo", "bar", undefined];
    const Result = await e
      .array(e.optional(e.string()))
      .length({ min: 3, max: 3 })
      .validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 5", async () => {
    const Target = { 0: "foo", "2": "bar", 5: "baz" };
    const Expected: string[] = [];

    Expected[0] = "foo";
    Expected[2] = "bar";
    Expected[5] = "baz";

    const Result = await e
      .deepCast(e.array(e.or([e.string(), e.undefined()])))
      .validate(Target)
      .catch((error) => {
        console.error(error);
        throw error;
      });

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
      });

    assertEquals(Result.length, 1);

    // deno-lint-ignore no-explicit-any
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
      });

    assertEquals(Result.length, 2);

    // deno-lint-ignore no-explicit-any
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
      });

    assertEquals(Result.length, 6);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      await e.array().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
    try {
      await e.array(e.string()).validate([1, 2, 3]);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 3);
    }
  });

  await ctx.step("Falsy Validation Case 3", async () => {
    try {
      await e.array(e.string()).length({ min: 3, max: 3 }).validate([1, 2]);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 3);
    }
  });

  await ctx.step("Falsy Validation Case 4", async () => {
    try {
      await e
        .array(e.string(), { cast: true })
        .validate({ 0: "foo", "2": "bar", 5: "baz", foo: "bar" });

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 5", async () => {
    try {
      await e
        .array(e.string(), { cast: true, noCastToArray: true })
        .validate("string");

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 6", async () => {
    try {
      await e
        .array(e.string(), { cast: true, noCastToArray: true })
        .validate("foo,bar");

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
      .validate(Target);
    assertEquals(JSON.stringify(Result), JSON.stringify(Target));
  });

  await ctx.step(
    "Falsy Array of Object (Termination on unexpected field)",
    async () => {
      try {
        await e
          .array(e.object({ foo: e.string() }))
          .validate([{ foo: 1, baz: "bar" }, { bar: "baz" }]);

        throw new Error(`Validation Invalid!`);
      } catch (e) {
        assertInstanceOf(e, ValidationException);
        assertEquals(e.issues.length, 2);
      }
    }
  );

  await ctx.step("Falsy Array of Object (Manual Termination)", async () => {
    try {
      await e
        .array(e.object({ foo: e.string({ throwsFatal: true }) }))
        .validate([{ foo: 1 }, { bar: "baz" }]);

      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
