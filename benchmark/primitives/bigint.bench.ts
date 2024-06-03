import ev2 from "../../lib/v2/validators.ts";
import ev3 from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const Targets = [1n, 2n, 3n, 4n, 5n];
const OptionalTargets = [1n, undefined, 3n, 4n, undefined];

Deno.bench("BigInt Validator V2 Bench", async () => {
  for (const Target of Targets) {
    await ev2.bigint().validate(Target);
  }
});

Deno.bench("BigInt Validator V3 Bench", async () => {
  for (const Target of Targets) {
    await ev3.bigint().validate(Target);
  }
});

Deno.bench("BigInt Zod Bench", async () => {
  for (const Target of Targets) {
    await z.bigint().parseAsync(Target);
  }
});

Deno.bench("BigInt (Optional) Validator V2 Bench", async () => {
  for (const Target of OptionalTargets) {
    await ev2.optional(ev2.bigint()).validate(Target);
  }
});

Deno.bench("BigInt (Optional) Validator V3 Bench", async () => {
  for (const Target of OptionalTargets) {
    await ev3.optional(ev3.bigint()).validate(Target);
  }
});

Deno.bench("BigInt (Optional) Zod Bench", async () => {
  for (const Target of OptionalTargets) {
    await z.optional(z.bigint()).parseAsync(Target);
  }
});
