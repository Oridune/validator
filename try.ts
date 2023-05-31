import e from "./mod.ts";

const S = e.string().sample("Saif Ali Khan");

const Shape = e.object({
  name: S,
  contact: e.number().length({ min: 11 }),
  role: e.enum(["admin", "user"]),
  active: e.boolean().custom(() => "active"),
  priority: e.number().amount({ min: 0, max: 10 }),
  metadata: e.any().sample({}),
});

console.log(Shape.toSample().data);
