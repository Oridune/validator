import e from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const Targets = [1n, 2n, 3n, 4n, 5n];
const OptionalTargets = [1n, undefined, 3n, 4n, undefined];

Deno.bench("BigInt Oridune Validator Bench", async () => {
  for (const Target of Targets) {
    await e.bigint().validate(Target);
  }
});

Deno.bench("BigInt Zod Bench", async () => {
  for (const Target of Targets) {
    await z.bigint().parseAsync(Target);
  }
});

Deno.bench("BigInt (Optional) Oridune Validator Bench", async () => {
  for (const Target of OptionalTargets) {
    await e.optional(e.bigint()).validate(Target);
  }
});

Deno.bench("BigInt (Optional) Zod Bench", async () => {
  for (const Target of OptionalTargets) {
    await z.optional(z.bigint()).parseAsync(Target);
  }
});
