import e from "../../mod.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("And Validator Tests", async (ctx) => {
  await ctx.step("Truthy Validation", async () => {
    const Target = { name: "John", age: 18 };
    const Result = await e
      .and(
        () => e.object({ name: e.string() }, { allowUnexpectedProps: true }),
        e.object({ age: e.number() }, { allowUnexpectedProps: true })
      )
      .validate(Target);
    assertEquals(JSON.stringify(Result), JSON.stringify(Target));
  });
});
