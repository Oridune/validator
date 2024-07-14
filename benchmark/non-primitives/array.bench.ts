import ev2 from "../../lib/v2/validators.ts";
import ev3 from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const V2Schema = () => ev2.array(ev2.string());

const V3Schema = () => ev3.array(ev3.string());

const ZSchema = () => z.array(z.string());

const Target1 = ["foo", "bar", "baz"];

Deno.bench("Object Validator V2 Bench", async () => {
    await V2Schema().validate(Target1);
});

Deno.bench("Object Validator V3 Bench", async () => {
    await V3Schema().validate(Target1);
});

Deno.bench("Object Zod Bench", async () => {
    await ZSchema().parseAsync(Target1);
});
