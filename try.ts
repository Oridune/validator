import e, { inferOutput } from "./mod.ts";

const S = e.string().sample("Saif Ali Khan");

const Shape = e.object({
  name: S,
  contact: e.number().length({ min: 11 }),
  role: e.enum(["admin", "user"]),
  active: e.boolean().custom(() => "active"),
  priority: e.number().amount({ min: 0, max: 10 }),
  tags: e.record(e.string()),
  metadata: e.any().sample({}),
  note: e.optional(e.string()),
});

type T = inferOutput<typeof Shape>;

console.log(Shape.toSample().data);
