// deno-lint-ignore-file no-explicit-any
import type { BaseValidator } from "./validators/base.ts";

export * from "../sharedTypes.ts";

export type inferShape<
  S,
  T = S extends () => infer V ? V : S,
> = T extends BaseValidator<infer Shape, infer _Input, infer _Output> ? Shape
  : never;

export type inferInput<
  S,
  T = S extends () => infer V ? V : S,
> = T extends BaseValidator<infer _Shape, infer Input, infer _Output> ? Input
  : never;

export type inferOutput<
  S,
  T = S extends () => infer V ? V : S,
> = T extends BaseValidator<infer _Shape, infer _Input, infer Output> ? Output
  : never;

export type inferObjectInput<S, T = S extends () => infer V ? V : S> = {
  [key in keyof T]: inferInput<T[key]>;
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
