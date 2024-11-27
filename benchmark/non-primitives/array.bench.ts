import e from "../../lib/v3/validators.ts";
import z from "https://deno.land/x/zod@v3.23.8/mod.ts";

const ESchema = () => e.array(e.string());

const ZSchema = () => z.array(z.string());

const Target1 = ["foo", "bar", "baz"];

Deno.bench("Array Oridune Validator Bench", async () => {
    await ESchema().validate(Target1);
});

Deno.bench("Array Zod Bench", async () => {
    await ZSchema().parseAsync(Target1);
});
