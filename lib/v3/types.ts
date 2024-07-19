// deno-lint-ignore-file no-explicit-any
import type { CastValidator } from "./validators/utility/cast.ts";
import type { DeepPartialValidator } from "./validators/utility/deepPartial.ts";
import type { DeepRequiredValidator } from "./validators/utility/deepRequired.ts";
import type { OmitValidator } from "./validators/utility/omit.ts";
import type { OptionalValidator } from "./validators/utility/optional.ts";
import type { PartialValidator } from "./validators/utility/partial.ts";
import type { PickValidator } from "./validators/utility/pick.ts";
import type { RequiredValidator } from "./validators/utility/required.ts";

export * from "../sharedTypes.ts";

export type inferShape<
  S,
  T = S extends () => infer V ? V : S,
> = T extends { shape: any } ? T["shape"] : never;

export type inferInput<
  S,
  T = S extends () => infer V ? V : S,
> = T extends { input: any } ? T["input"] : never;

export type inferOutput<
  S,
  T = S extends () => infer V ? V : S,
> = T extends { output: any } ? T["output"] : never;

export type inferObjectInput<
  S,
  T = S extends () => infer V ? V : S,
  R = {
    [key in keyof T]: inferInput<T[key]>;
  },
> =
  & {
    [K in keyof R as undefined extends R[K] ? K : never]?: Exclude<
      R[K],
      undefined
    >;
  }
  & {
    [K in keyof R as undefined extends R[K] ? never : K]: R[K];
  };

export type inferObjectOutput<S, T = S extends () => infer V ? V : S> = {
  [key in keyof T]: inferOutput<T[key]>;
};

export type inferEachInput<
  S extends Array<any> | (() => Array<any>),
  T = S extends () => infer V ? V : S,
> = {
  [K in keyof T]: inferInput<T[K]>;
};

export type inferEachOutput<
  S extends Array<any> | (() => Array<any>),
  T = S extends () => infer V ? V : S,
> = {
  [K in keyof T]: inferOutput<T[K]>;
};

export type TModifierValidators =
  | PickValidator<any, any, any>
  | OmitValidator<any, any, any>
  | CastValidator<any, any, any>
  | OptionalValidator<any, any, any>
  | PartialValidator<any, any, any>
  | RequiredValidator<any, any, any>
  | DeepPartialValidator<any, any, any>
  | DeepRequiredValidator<any, any, any>;
