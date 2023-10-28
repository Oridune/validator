import e from "./mod.ts";

const S = e.optional(e.string().sample("Saif Ali Khan")).default("something");

const Schema = e
  .object({
    name: S,
    contact: e.number().length({ min: 11 }),
    role: e.enum(["admin", "user"]),
    active: e.boolean().custom(() => "active"),
    priority: e.number().amount({ min: 0, max: 10 }),
  })
  .extends(
    e.pick(
      e.object({
        tags: e.record(e.string()),
        metadata: e.any().sample({}),
        note: e.optional(e.string()),
      }),
      { keys: ["tags", "metadata"] }
    )
  )
  .rest(e.string());

const User = await Schema.validate({
  contact: 12345678909876,
  role: "admin",
  active: true,
  priority: 1,
  tags: {},
  metadata: {},
  something: "nothing",
}).catch(console.error);

console.log(User);

// console.log(Schema.toSample().data);

// class User {
//   static isValid(user: User | string) {
//     return user instanceof User;
//   }
// }

// const UserSchema = e.object({
//   username: e.string().custom((ctx) => {
//     ctx.output = undefined;
//   }),
//   password: e.optional(e.string()),
//   profile: e.object({
//     name: e.string(),
//     dob: e.date(),
//   }),
//   user: e.optional(e.instanceOf(User)),
//   isUser: e.optional(e.if(User.isValid)),
// });

// const PostSchema = e.object({
//   title: e.string(),
//   description: e.string(),
//   drafted: e.optional(e.boolean()).default(true),
//   createdAt: e.optional(e.date()).default(() => new Date()),
//   updatedAt: e.optional(e.date()).default(() => new Date()),
// });

// try {
//   console.log(
//     await UserSchema.validate({
//       username: "saffellikhan",
//       password: undefined,
//       profile: {
//         name: "Saif Ali Khan",
//         dob: new Date(),
//       },
//       user: new User(),
//       isUser: new User(),
//     }),
//     await UserSchema.validate({
//       username: "saffellikhan",
//       profile: {
//         name: "Saif Ali Khan",
//         dob: new Date(),
//       },
//       user: new User(),
//       isUser: new User(),
//     })
//   );
// } catch (error) {
//   console.log(error);
// }
