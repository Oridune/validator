import e from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const ESchema = () => e.tuple([e.string(), e.number(), e.boolean()]);

const ZSchema = () => z.tuple([z.string(), z.number(), z.boolean()]);

const Target1 = ["foo", 1, true];

Deno.bench("Tuple Oridune Validator Bench", async () => {
    await ESchema().validate(Target1);
});

Deno.bench("Tuple Zod Bench", async () => {
    await ZSchema().parseAsync(Target1);
});
