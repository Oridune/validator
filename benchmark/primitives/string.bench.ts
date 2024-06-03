import ev2 from "../../lib/v2/validators.ts";
import ev3 from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const Targets = ["something", "foo"];
const OptionalTargets = ["true", undefined];

Deno.bench("String Validator V2 Bench", async () => {
  for (const Target of Targets) {
    await ev2.string().min(3).max(10).validate(Target);
  }
});

Deno.bench("String Validator V3 Bench", async () => {
  for (const Target of Targets) {
    await ev3.string().min(3).max(10).validate(Target);
  }
});

Deno.bench("String Zod Bench", async () => {
  for (const Target of Targets) {
    await z.string().min(3).max(10).parseAsync(Target);
  }
});

Deno.bench("String (Optional) Validator V2 Bench", async () => {
  for (const Target of OptionalTargets) {
    await ev2.optional(ev2.string().min(3).max(10)).validate(Target);
  }
});

Deno.bench("String (Optional) Validator V3 Bench", async () => {
  for (const Target of OptionalTargets) {
    await ev3.optional(ev3.string().min(3).max(10)).validate(Target);
  }
});

Deno.bench("String (Optional) Zod Bench", async () => {
  for (const Target of OptionalTargets) {
    await z.optional(z.string().min(3).max(10)).parseAsync(Target);
  }
});
