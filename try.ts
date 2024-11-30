import e, { ValidationDebugger } from "./v3.ts";

ValidationDebugger.enabled = true;
ValidationDebugger.logFilters = { label: "OptionalValidator" };

const ActivitySchema = () =>
  e.object({
    _id: e.optional(e.string()).default("1234567890"),
    description: e.string(),
    user: e.string(),
    enabled: e.optional(e.boolean),
  });

const Small = e.pick(ActivitySchema(), ["user"]);

// console.log("Small", await Small.validate({ user: "user" }));

// console.log(
//   await ActivitySchema().validate({
//     description: "abc",
//     user: "user",
//     enabled: true,
//   }),
// );

// User Schema
const UserSchema = () =>
  e.object({
    _id: e.optional(e.string()).default("1234567890"),
    username: e.string().isURL().min(5).max(50),
    password: e.optional(e.string({ patterns: [/^.*$/] })).default("topSecret"),
    profile: e.object({
      name: e.string(),
      dob: e.optional(e.date()).default(() => new Date()),
    }),
    age: e.optional(e.number()).default(18),
    followers: e.optional(e.array(e.if(e.string().test))),
    posts: e.optional(e.array(e.if(e.string().test))),
    latestPost: e.optional(e.if(e.string().test)),
    activity: e.optional(e.array(ActivitySchema())),
    latestActivity: e.optional(ActivitySchema()),
    createdAt: e.optional(e.date()).default(() => new Date()),
    updatedAt: e.optional(e.date()).default(() => new Date()),
    timeline: e.optional(
      e
        .array(
          e.object({
            _id: e.optional(e.string()).default("1234567890"),
            message: e.string(),
            priority: e.value(100),
            createdAt: e.optional(e.date()).default(() => new Date()),
          }),
        )
        .min(1),
    ),
    tags: e.array(e.string()),
  });

// const User1Id = "123";
// const User2Id = "456";

// const UsersData = [
//   {
//     _id: User1Id,
//     username: "saffellikhan",
//     profile: {
//       name: "Saif Ali Khan",
//       // dob: new Date(),
//     },
//     activity: [
//       {
//         description: "Logged in!",
//         user: User1Id,
//       },
//       {
//         description: "Waved by someone!",
//         user: User2Id,
//       },
//     ],
//     latestActivity: {
//       description: "Waved by someone!",
//       user: User2Id,
//     },
//     timeline: [{ message: "Hello world!" }],
//   },
//   {
//     _id: User2Id,
//     username: "abdullah",
//     password: "secret3",
//     profile: {
//       name: "Abdullah Khan",
//       dob: new Date(),
//     },
//     activity: [
//       {
//         description: "Waved by someone!",
//         user: User1Id,
//       },
//     ],
//     latestActivity: {
//       description: "Waved by someone!",
//       user: User1Id,
//     },
//   },
// ];

// console.log(UserSchema().toSample().data);

// const data = {
//   foo: "bar",
//   bar: { baz: "foo" },
//   hello: [{ hola: "mundo" }, ""],
// };

const data = UserSchema().toSample().data.stringify(null, 2);

console.log(data);
