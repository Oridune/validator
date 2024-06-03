import ev2 from "../../lib/v2/validators.ts";
import ev3 from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const V2Schema = ev2.object({
  username: ev2.string().min(3).max(50),
  password: ev2.string(),
  active: ev2.boolean(),
  profile: ev2.object({
    phone: ev2.number().min(999999999).max(99999999999),
    address: ev2.string().max(100),
  }),
});

const V3Schema = ev3.object({
  username: ev3.string().min(3).max(50),
  password: ev3.string(),
  active: ev3.boolean(),
  profile: ev3.object({
    phone: ev3.number().min(999999999).max(99999999999),
    address: ev3.string().max(100),
  }),
});

const ZSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string(),
  active: z.boolean(),
  profile: z.object({
    phone: z.number().min(999999999).max(99999999999),
    address: z.string().max(100),
  }),
});

const Target = {
  username: "john",
  password: "johndoe",
  active: true,
  profile: {
    phone: 3056763454,
    address: "This is a test address",
  },
};

Deno.bench("Object Validator V2 Bench", async () => {
  await V2Schema.validate(Target);
});

Deno.bench("Object Validator V3 Bench", async () => {
  await V3Schema.validate(Target);
});

Deno.bench("Object Zod Bench", async () => {
  await ZSchema.parseAsync(Target);
});
