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

const UserSchema = e.object({
  username: e.string().custom((ctx) => {
    ctx.output = undefined;
  }),
  password: e.optional(e.string()),
  profile: e.object({
    name: e.string(),
    dob: e.date(),
  }),
});

console.log(
  await UserSchema.validate({
    username: "saffellikhan",
    password: undefined,
    profile: {
      name: "Saif Ali Khan",
      dob: new Date(),
    },
  }),
  await UserSchema.validate({
    username: "saffellikhan",
    profile: {
      name: "Saif Ali Khan",
      dob: new Date(),
    },
  })
);
