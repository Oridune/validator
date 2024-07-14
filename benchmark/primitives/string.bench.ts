import e from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const Targets = ["something", "foo"];
const OptionalTargets = ["true", undefined];

Deno.bench("String Oridune Validator Bench", async () => {
  for (const Target of Targets) {
    await e.string().min(3).max(10).validate(Target);
  }
});

Deno.bench("String Zod Bench", async () => {
  for (const Target of Targets) {
    await z.string().min(3).max(10).parseAsync(Target);
  }
});

Deno.bench("String (Optional) Oridune Validator Bench", async () => {
  for (const Target of OptionalTargets) {
    await e.optional(e.string().min(3).max(10)).validate(Target);
  }
});

Deno.bench("String (Optional) Zod Bench", async () => {
  for (const Target of OptionalTargets) {
    await z.optional(z.string().min(3).max(10)).parseAsync(Target);
  }
});
