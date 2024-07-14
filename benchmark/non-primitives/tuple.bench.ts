import ev2 from "../../lib/v2/validators.ts";
import ev3 from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const V2Schema = () => ev2.tuple([ev2.string(), ev2.number(), ev2.boolean()]);

const V3Schema = () => ev3.tuple([ev3.string(), ev3.number(), ev3.boolean()]);

const ZSchema = () => z.tuple([z.string(), z.number(), z.boolean()]);

const Target1 = ["foo", 1, true];

Deno.bench("Object Validator V2 Bench", async () => {
    await V2Schema().validate(Target1);
});

Deno.bench("Object Validator V3 Bench", async () => {
    await V3Schema().validate(Target1);
});

Deno.bench("Object Zod Bench", async () => {
    await ZSchema().parseAsync(Target1);
});
