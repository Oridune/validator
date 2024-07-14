import e from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const Targets = [true, false];
const OptionalTargets = [true, false, undefined];

Deno.bench("Boolean Oridune Validator Bench", async () => {
  for (const Target of Targets) {
    await e.boolean().validate(Target);
  }
});

Deno.bench("Boolean Zod Bench", async () => {
  for (const Target of Targets) {
    await z.boolean().parseAsync(Target);
  }
});

Deno.bench("Boolean (Optional) Oridune Validator Bench", async () => {
  for (const Target of OptionalTargets) {
    await e.optional(e.boolean()).validate(Target);
  }
});

Deno.bench("Boolean (Optional) Zod Bench", async () => {
  for (const Target of OptionalTargets) {
    await z.optional(z.boolean()).parseAsync(Target);
  }
});
