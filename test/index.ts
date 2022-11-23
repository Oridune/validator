// deno-lint-ignore-file require-await
// recursion

import e from "../mod.ts";

(async () => {
  try {
    // const RawUser = {
    //   name: "John",
    //   age: "18",
    //   active: false,
    //   permissions: "alpha,beta,gama",
    //   range: "0,100, true, 0",
    //   metadata: {
    //     gender: "malee",
    //   },
    //   followers: [
    //     {
    //       name: "David",
    //       age: 15,
    //       // active: false,
    //       metadata: {
    //         // gender: "male",
    //       },
    //       // followers: [
    //       //   {
    //       //     name: "David",
    //       //     age: "15",
    //       //     active: true,
    //       //     metadata: {
    //       //       gender: "malee",
    //       //     },
    //       //   },
    //       //   {
    //       //     name: "Frank",
    //       //     age: 16,
    //       //     active: true,
    //       //   },
    //       // ],
    //     },
    //     {
    //       name: "Frank",
    //       age: 16,
    //       active: false,
    //       metadata: {
    //         gender: "male",
    //       },
    //     },
    //   ],
    // };

    // // const Schema = e.string<"John">();
    // // const Result = await Schema.validate(RawUser.name);
    // // console.log(Result);

    // // const Schema = e.number<1>();
    // // const Result = await Schema.validate(RawUser.age);
    // // console.log(Result);

    // // const Schema = e.enum(["male", "female"]).custom(() => "");
    // // const Results = await Schema.validate(RawUser.metadata.gender);
    // // console.log(Results);

    // // const Schema = e.boolean(true);
    // // const Results = await Schema.validate(RawUser.active);
    // // console.log(Results);

    // const IsName = e
    //   .optional(
    //     e.string({
    //       messages: {
    //         notString: "A username should be a valid string!",
    //       },
    //     }),
    //     {
    //       nullish: false,
    //     }
    //   )
    //   .default("");

    // const Schema = e.object({
    //   name: IsName,
    //   age: e.number({ casting: true }).custom((age, ctx) => {
    //     // ctx.shouldTerminate();
    //     if (age > 16) throw "You are not allowed!";
    //   }),
    //   active: e.or([e.true(), e.number()]),
    //   permissions: e.array(e.string(), { casting: true, splitter: "," }),
    //   range: e.optional(
    //     e
    //       .tuple(
    //         [
    //           e.number({ casting: true }),
    //           e.number({ casting: true }),
    //           e.boolean({ casting: true }),
    //         ],
    //         {
    //           casting: true,
    //           splitter: ",",
    //         }
    //       )
    //       .rest(e.boolean({ casting: true }))
    //   ),
    //   metadata: e.partial(
    //     e
    //       .object({
    //         gender: e.enum(() => ["male", "female"]),
    //       })
    //       .extend(
    //         e.object({
    //           foo: e.value("bar" as const).custom(() => "baz" as const),
    //         })
    //       ),
    //     { ignore: ["foo"] }
    //   ),
    //   followers: e.array(
    //     e.omit(
    //       e.object({
    //         name: e.string().custom((_, ctx) => {
    //           ctx.shouldTerminate();
    //         }),
    //         age: e.number(),
    //         active: e.boolean(),
    //         metadata: e.record(e.enum(["male", "female"])),
    //       })
    //       // { keys: ["metadata"] }
    //     )
    //   ),
    // });

    // const Results = await Schema.validate(RawUser, { label: "CreateUser" });
    // console.log(Results.range);

    // // const User = await UserSchema.validate(RawUser);

    // // const Schema = e.object({
    // //   name: e.string(),
    // //   age: e.number(),
    // //   metadata: e.object({
    // //     gender: e.enum(["male", "female"]),
    // //   }),
    // //   followers: e.array(
    // //     e.object({
    // //       name: e.string(),
    // //       age: e.number(),
    // //     })
    // //   ),
    // // });

    // console.log(e.string().describe("Username").length({ max: 10 }).toJSON());
    // console.log(
    //   e
    //     .number()
    //     .describe("Phone Number")
    //     .length({ min: 9, max: 11 })
    //     .amount({ max: 99999999999 })
    //     .toJSON()
    // );
    // console.log(e.boolean().toJSON());

    const Schema = e
      .object({
        product: e.optional(e.string()).default(1),
        contact: e.partial(
          e.object({
            type: e.in(["email", "phone"]),
            value: e.or([e.number(), e.string()]),
          })
        ),
        note: e.optional(e.string()),
        tags: e
          .array(
            e.and([
              e.string().matches({ regex: /a/ }),
              e.string().matches({ regex: /b/ }),
            ])
          )
          .length({ min: 3, max: 15 }),
      })
      .extend(
        e.object({
          labels: e
            .tuple([e.string(), e.number()])
            .rest(e.string())
            .length({ min: 2, max: 3 }),
          metadata: e.record(e.string()),
        })
      )
      .rest(e.record(e.string()))
      .describe("Create an order")
      .toJSON();

    console.log(JSON.stringify(Schema, undefined, 2));

    // // Body Validator
    // const BodyValidator = e.object({
    //   accountId: e.value("" as string | undefined),
    //   fname: e.string().length({ min: 1, max: 20 }),
    //   mname: e.optional(e.string(), { nullish: true }),
    //   lname: e.optional(e.string(), { nullish: true }),
    //   labels: e.optional(e.array(e.string(), { casting: true })),
    //   birthTime: e.optional(e.number({ casting: true })),
    //   password: e.string().matches({
    //     regex:
    //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //     shouldTerminate: true,
    //   }),
    //   confirmPassword: e.string().custom((password, ctx) => {
    //     if (ctx.input.password !== password) {
    //       throw "Password don't match with Confirm Password!";
    //     }
    //   }),
    //   metadata: e.optional(
    //     e.array(e.object({ key: e.string(), value: e.string() }), {
    //       casting: true,
    //     })
    //   ),
    // });

    // // Generate Json Schema
    // const JsonSchema = BodyValidator.toJSON();

    // // Body Validation
    // const Body = await BodyValidator.validate(
    //   {
    //     fname: "Saif Ali",
    //     lname: "Khan",
    //     password: "John123!",
    //     confirmPassword: "John123!",
    //   },
    //   { label: "Users::body" }
    // );

    // console.log("Results", Body);
  } catch (err) {
    console.log(err, err.issues);
  }
})();
