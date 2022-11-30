import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Tuple Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    try {
      const Target: string[] = [];
      const Result = await e.tuple([]).validate(Target);
      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    try {
      const Target = ["hello"];
      const Result = await e.tuple([e.string()]).validate(Target);
      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    try {
      const Target = ["foo", "bar", "baz"];
      const Result = await e
        .tuple([e.string(), e.string(), e.string()])
        .validate(Target);

      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Truthy Validation Case 4", async () => {
    try {
      const Target = ["foo", "bar", undefined];
      const Result = await e
        .tuple([e.string(), e.string(), e.optional(e.string())])
        .length({ min: 3, max: 3 })
        .validate(Target);
      assertEquals(Result, Target);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      await e.tuple([]).validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
    try {
      await e.tuple([e.string(), e.string(), e.string()]).validate([1, 2, 3]);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 3);
    }
  });

  await ctx.step("Tuple of Object", async () => {
    try {
      const Target = [{ foo: "bar" }, { bar: "buzz" }];
      const Result = await e
        .tuple([e.object({ foo: e.string() }), e.object({ bar: e.string() })])
        .validate(Target);
      assertEquals(JSON.stringify(Result), JSON.stringify(Target));
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      throw e;
    }
  });

  await ctx.step(
    "Falsy Tuple of Object (Termination on unexpected field)",
    async () => {
      try {
        await e
          .tuple([e.object({ foo: e.string() })])
          .validate([{ foo: 1 }, { bar: "baz" }]);
        throw new Error(`Validation Invalid!`);
      } catch (e) {
        if (e instanceof ValidationException) console.log(e.issues);
        assertInstanceOf(e, ValidationException);
        assertEquals(e.issues.length, 1);
      }
    }
  );

  await ctx.step("Falsy Tuple of Object (Manual Termination)", async () => {
    try {
      await e
        .tuple([e.object({ foo: e.string({ throwsFatal: true }) })])
        .validate([{ foo: 1 }]);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      if (e instanceof ValidationException) console.log(e.issues);
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
