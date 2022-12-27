// deno-lint-ignore-file no-explicit-any
import { BaseValidator } from "./validators/base.ts";

export type InferInput<T extends BaseValidator<any, any, any>> =
  T extends BaseValidator<any, infer R, any> ? R : unknown;

export type InferOutput<T extends BaseValidator<any, any, any>> =
  T extends BaseValidator<any, any, infer R> ? R : unknown;
