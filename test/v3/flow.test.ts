// deno-lint-ignore-file no-explicit-any
import e from "./target.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test("Validator Flow Tests", async (ctx) => {
  await ctx.step("User schema validation", async () => {
    const ActivitySchema = () =>
      e.object({
        _id: e.optional(e.string()).default("1234567890"),
        description: e.string(),
        user: e.string(),
        enabled: e.optional(e.boolean()),
      });

    // User Schema
    const UserSchema = () =>
      e.object({
        _id: e.optional(e.string()).default("1234567890"),
        username: e.string(),
        password: e.optional(e.string()).default("topSecret"),
        profile: e.object({
          name: e.string(),
        }),
        age: e.optional(e.number()).default(18),
        followers: e.optional(e.array(e.if(e.string().test))),
        posts: e.optional(e.array(e.if(e.string().test))),
        latestPost: e.optional(e.if(e.string().test)),
        activity: e.optional(e.array(ActivitySchema())),
        latestActivity: e.optional(ActivitySchema()),
        timeline: e.optional(
          e
            .array(
              e.object({
                _id: e.optional(e.string()).default("1234567890"),
                message: e.string(),
                priority: e.value(100),
              }),
            )
            .min(1),
        ),
      });

    const User1Id = "123";
    const User2Id = "456";

    const UsersData = [
      {
        _id: User1Id,
        username: "saffellikhan",
        profile: {
          name: "Saif Ali Khan",
        },
        activity: [
          {
            description: "Logged in!",
            user: User1Id,
          },
          {
            description: "Waved by someone!",
            user: User2Id,
          },
        ],
        latestActivity: {
          description: "Waved by someone!",
          user: User2Id,
        },
        timeline: [{ message: "Hello world!" }],
      },
      {
        _id: User2Id,
        username: "abdullah",
        password: "secret3",
        profile: {
          name: "Abdullah Khan",
        },
        activity: [
          {
            description: "Waved by someone!",
            user: User1Id,
          },
        ],
        latestActivity: {
          description: "Waved by someone!",
          user: User1Id,
        },
      },
    ];

    const Result = await e.array(e.deepCast(UserSchema())).validate(UsersData)
      .catch(
        (error) => {
          console.error(error);
          throw error;
        },
      ) satisfies Array<{
        _id: string;
        username: string;
        password: string;
        profile: {
          name: string;
        };
        age: number;
        followers?: Array<string>;
        posts?: Array<string>;
        latestPost?: string;
        activity?: Array<{
          _id: string;
          description: string;
          user: string;
          enabled?: boolean;
        }>;
        latestActivity?: {
          _id: string;
          description: string;
          user: string;
          enabled?: boolean;
        };
        timeline?: Array<{
          _id: string;
          message: string;
          priority: number;
        }>;
      }>;

    assertEquals(Result, [
      {
        _id: "123",
        activity: [
          {
            _id: "1234567890",
            description: "Logged in!",
            user: "123",
          },
          {
            _id: "1234567890",
            description: "Waved by someone!",
            user: "456",
          },
        ],
        age: 18,
        latestActivity: {
          _id: "1234567890",
          description: "Waved by someone!",
          user: "456",
        },
        password: "topSecret",
        profile: {
          name: "Saif Ali Khan",
        },
        timeline: [
          {
            _id: "1234567890",
            message: "Hello world!",
            priority: 100,
          },
        ],
        username: "saffellikhan",
      },
      {
        _id: "456",
        activity: [
          {
            _id: "1234567890",
            description: "Waved by someone!",
            user: "123",
          },
        ],
        age: 18,
        latestActivity: {
          _id: "1234567890",
          description: "Waved by someone!",
          user: "123",
        },
        password: "secret3",
        profile: {
          name: "Abdullah Khan",
        },
        username: "abdullah",
      },
    ] as any);
  });
});
