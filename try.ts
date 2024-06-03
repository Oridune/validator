import e, { BaseValidator } from "./v3.ts";

BaseValidator.DebugMode = true;

const Schema1 = e.object({
  foo: e.string(),
  bar: e.string(),
  baz: e.number(),
  hel: e.number(),
});

const Schema2 = e.partial(e.pick(Schema1, ["foo", "bar"]));

const Schema3 = e.omit(Schema1, ["foo", "bar"]);

const Schema4 = e.object().extends(Schema2)
  .extends(Schema3);

await Schema4.validate({}).catch(console.error);
