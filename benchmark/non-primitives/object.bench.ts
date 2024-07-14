import e from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const ESchema = () =>
  e.object({
    username: e.string().min(3).max(50),
    password: e.string(),
    active: e.boolean(),
    profile: e.object({
      phone: e.number().min(999999999).max(99999999999),
      address: e.string().max(100),
    }),
    tags: e.array(e.string()),
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

Deno.bench("Object Oridune Validator Bench", async () => {
  await ESchema().validate(Target1);
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

Deno.bench("Object (Unexpected Prop) Oridune Validator Bench", async () => {
  await ESchema().validate(Target2).catch(() => {
    // Do nothing...
  });
});

Deno.bench("Object (Unexpected Prop) Zod Bench", async () => {
  await ZSchema().strict().parseAsync(Target2).catch(() => {
    // Do nothing...
  });
});
