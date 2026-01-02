import e from "../../lib/v3/validators.ts";
import * as z from "npm:zod@latest";

const ESchema = () => e.tuple([e.string(), e.number(), e.boolean()]);

const ZSchema = () => z.tuple([z.string(), z.number(), z.boolean()]);

const Target1 = ["foo", 1, true];

Deno.bench("Tuple Oridune Validator Bench", async () => {
    await ESchema().validate(Target1);
});

Deno.bench("Tuple Zod Bench", async () => {
    await ZSchema().parseAsync(Target1);
});
