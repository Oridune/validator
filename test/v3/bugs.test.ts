import e from "./target.ts";

Deno.test({
    name: "Test encountered bugs",
    async fn(t) {
        await t.step("Default value in a deep array doesn't get assigned on the correct position!", async () => {

            const Schema = e.deepPartial(e.deepCast(
                e.object({
                    invoices: e.array(e.object({
                        currency: e.in(["lyd", "usd"]).checkpoint(),
                        items: e.array(e.object({
                            date: e.optional(e.instanceOf(Date, { instantiate: true })).default(() => new Date()),
                            amount: e.number(),
                        })),
                    })),
                })
            ));

            const results = await Schema.validate({
                invoices: {
                    '$[invoice1]': {
                        items: [{
                            amount: 1
                        }]
                    }
                }
            }, {
                deepOptions: {
                    preserveShape: true,
                },
            });

            // deno-lint-ignore no-explicit-any
            if (!(results.invoices?.["$[invoice1]" as any]?.items?.[0]?.date instanceof Date))
                throw new Error("A default value was not generated!", { cause: results });
        });
    }
});
