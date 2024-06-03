import ev2 from "../../lib/v2/validators.ts";
import ev3 from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const Targets = [true, false];
const OptionalTargets = [true, false, undefined];

Deno.bench("Boolean Validator V2 Bench", async () => {
  for (const Target of Targets) {
    await ev2.boolean().validate(Target);
  }
});

Deno.bench("Boolean Validator V3 Bench", async () => {
  for (const Target of Targets) {
    await ev3.boolean().validate(Target);
  }
});

Deno.bench("Boolean Zod Bench", async () => {
  for (const Target of Targets) {
    await z.boolean().parseAsync(Target);
  }
});

Deno.bench("Boolean (Optional) Validator V2 Bench", async () => {
  for (const Target of OptionalTargets) {
    await ev2.optional(ev2.boolean()).validate(Target);
  }
});

Deno.bench("Boolean (Optional) Validator V3 Bench", async () => {
  for (const Target of OptionalTargets) {
    await ev3.optional(ev3.boolean()).validate(Target);
  }
});

Deno.bench("Boolean (Optional) Zod Bench", async () => {
  for (const Target of OptionalTargets) {
    await z.optional(z.boolean()).parseAsync(Target);
  }
});
