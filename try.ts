import e, { inferInput, inferOutput } from "./mod.ts";

// const Schema = e.object({
//   username: e.optional(e.string()),
//   password: e.optional(e.string()),
// });

// const RequiredSchema = e.required(Schema);

// console.log(await RequiredSchema.validate({}));

// const S = () =>
//   e.optional(e.string().sample("Saif Ali Khan")).default("something");

enum Role {
  ADMIN = "admin",
  USER = "user",
}

// const User = e.object({
//   oauthAppId: e.string(),
// });

// console.log(User.toSample());

// const SubSchema = () =>
//   e.required(
//     e.object({
//       tags: e.optional(e.record(e.string())),
//       metadata: e.optional(e.any().sample({})),
//       note: e.optional(e.string()),
//     }),
//   ).custom((ctx) => {
//   });

// const Schema = () =>
//   e
//     .object({
//       name: S,
//       contact: e.optional(e.optional(e.number().length({ min: 11 }))),
//       role: e.optional(e.enum(Object.values(Role))),
//       active: () => e.optional(e.boolean().custom(() => "active")),
//       priority: e.optional(e.number().amount({ min: 0, max: 10 })),
//       profile: e.optional(
//         e.object({
//           fullName: e.string(),
//           dob: e.date(),
//         }),
//       ),
//       tags: e.optional(e.array(e.string())),
//     })
//     .extends(
//       SubSchema,
//     );

// const R = await Schema().validate();

console.log(
  await e.array(e.or([
    e.string(),
    e.object({
      role: e.optional(e.in(Object.values(Role))).default(Role.USER),
    }),
  ])).validate([{}]).catch(console.error),
);

// for (let i = 0; i < 1000; i++) {
//   console.log(i);
//   e.deepCast(e.deepPartial(SubSchema, { overrideOptionalValidator: false }));
// }
// .rest(e.string());

// console.log(
//   await e
//     .optional(e.record(e.number({ cast: true }).max(1).min(0), { cast: true }))
//     .validate({ collaborates: -10 })
//     .catch((error) => {
//       console.error(error);
//       throw error;
//     })
// );

// const User = await Schema.validate({
//   contact: 12345678909876,
//   role: "admin",
//   active: true,
//   priority: 1,
//   tags: {},
//   metadata: {},
//   something: "nothing",
// });

// console.log(User);

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
