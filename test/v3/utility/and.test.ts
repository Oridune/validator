import e from "../target.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("And Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation Case 1", async () => {
    const Target = { name: "John", age: 18 };
    const Result = await e
      .and(
        [
          e.object({ name: e.string() }, { allowUnexpectedProps: true }),
          e.object({ age: e.number() }, { allowUnexpectedProps: true }),
        ],
        {},
      )
      .validate(Target) satisfies { name: string; age: number };

    assertEquals(JSON.stringify(Result), JSON.stringify(Target));
  });

  await ctx.step("Truthy Validation Case 2", async () => {
    const Target = "Hello";
    const Result = await e
      .and([e.string(), e.string()])
      .validate(Target) satisfies string;

    assertEquals(JSON.stringify(Result), JSON.stringify(Target));
  });

  await ctx.step("Truthy Validation Case 3", async () => {
    const Target = [] as string[];
    const Result = await e
      .and([e.array(e.string()), e.array(e.number())])
      .validate(Target) satisfies string[] & number[];

    assertEquals(JSON.stringify(Result), JSON.stringify(Target));
  });
});
