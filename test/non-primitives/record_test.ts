import e, { ValidationException } from "../../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Record Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Target = {};
    const Result = await e.record().validate(Target);
    assertEquals(Result, Target);
  });

  await ctx.step("Falsy Validation", async () => {
    try {
      await e.record().validate("hi");
      throw new Error(`Validation Invalid!`);
    } catch (e) {
      assertInstanceOf(e, ValidationException);
      assertEquals(e.issues.length, 1);
    }
  });

  await ctx.step("Output chain check", async () => {
    const Target = {
      foo: "bar",
      bar: "baz",
      hello: "world",
    };

    const Target2 = {
      ...Target,
      bar: "buzz",
    };

    const Result = await e
      .record(
        e
          .string()
          .custom((ctx) => {
            if (ctx.index === "bar") {
              assertEquals(ctx.property, "bar");
              assertEquals(ctx.input, Target.bar);
              assertEquals(ctx.output, Target.bar);
              ctx.output = "buzz";
            }
          })
          .custom((ctx) => {
            if (ctx.index === "bar") {
              assertEquals(ctx.property, "bar");
              assertEquals(ctx.input, Target.bar);
              assertEquals(ctx.output, "buzz");
            }
          })
      )
      .custom((ctx) => {
        assertEquals(ctx.input, Target);
        assertEquals(ctx.output, Target2);
      })
      .validate(Target);

    assertObjectMatch(Result, Target2);
  });
});
