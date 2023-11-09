import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("InstanceOf Validator Tests", async (ctx) => {
  class User {
    constructor(public id = "user") {}
  }

  const Target = new User();

  await ctx.step("Truthy Validation Case 1", async () => {
    const Result = await e.instanceOf(User).validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Result = await e
      .instanceOf(User, { instantiate: true, allowUndefined: true })
      .validate();

    assertInstanceOf(Result, User);
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Id = "new-user";
    const Result = await e.instanceOf(User, { instantiate: true }).validate(Id);

    assertInstanceOf(Result, User);
    assertEquals(Result.id, Id);
  });

  await ctx.step("Falsy Validation Case 1", async () => {
    try {
      await e.instanceOf(User).validate(User);
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 2", async () => {
    try {
      await e.instanceOf(User).validate();
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Falsy Validation Case 3", async () => {
    try {
      await e.instanceOf(User, { instantiate: true }).validate();
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });
});
