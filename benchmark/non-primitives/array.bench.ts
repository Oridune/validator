import e from "../../lib/v3/validators.ts";
import * as z from "npm:zod/v4";

const ESchema = () => e.array(e.string());

const ZSchema = () => z.array(z.string());

const Target1 = ["foo", "bar", "baz"];

Deno.bench("Array Oridune Validator Bench", async () => {
    await ESchema().validate(Target1);
});

Deno.bench("Array Zod Bench", async () => {
    await ZSchema().parseAsync(Target1);
});
