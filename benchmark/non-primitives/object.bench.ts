import ev2 from "../../lib/v2/validators.ts";
import ev3 from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const V2Schema = () =>
  ev2.object({
    username: ev2.string().min(3).max(50),
    password: ev2.string(),
    active: ev2.boolean(),
    profile: ev2.object({
      phone: ev2.number().min(999999999).max(99999999999),
      address: ev2.string().max(100),
    }),
    tags: ev2.array(ev2.string()),
  });

const V3Schema = () =>
  ev3.object({
    username: ev3.string().min(3).max(50),
    password: ev3.string(),
    active: ev3.boolean(),
    profile: ev3.object({
      phone: ev3.number().min(999999999).max(99999999999),
      address: ev3.string().max(100),
    }),
    tags: ev3.array(ev3.string()),
  });

const ZSchema = () =>
  z.object({
    username: z.string().min(3).max(50),
    password: z.string(),
    active: z.boolean(),
    profile: z.object({
      phone: z.number().min(999999999).max(99999999999),
      address: z.string().max(100),
    }),
    tags: z.array(z.string()),
  });

const Target1 = {
  username: "john",
  password: "johndoe",
  active: true,
  profile: {
    phone: 3056763454,
    address: "This is a test address",
  },
  tags: ["foo", "bar"],
};

Deno.bench("Object Validator V2 Bench", async () => {
  await V2Schema().validate(Target1);
});

Deno.bench("Object Validator V3 Bench", async () => {
  await V3Schema().validate(Target1);
});

Deno.bench("Object Zod Bench", async () => {
  await ZSchema().parseAsync(Target1);
});

const Target2 = {
  username: "john",
  password: "johndoe",
  actives: true,
  profile: {
    phone: 3056763454,
    address: "This is a test address",
  },
  tags: ["foo", "bar"],
};

Deno.bench("Object (Unexpected Prop) Validator V2 Bench ", async () => {
  await V2Schema().validate(Target2).catch(() => {
    // Do nothing...
  });
});

Deno.bench("Object (Unexpected Prop) Validator V3 Bench", async () => {
  await V3Schema().validate(Target2).catch(() => {
    // Do nothing...
  });
});

Deno.bench("Object (Unexpected Prop) Zod Bench", async () => {
  await ZSchema().strict().parseAsync(Target2).catch(() => {
    // Do nothing...
  });
});
