// deno-lint-ignore-file no-explicit-any
import {
  BaseValidator,
  ObjectValidator,
  RecordValidator,
  ArrayValidator,
  TupleValidator,
  EnumValidator,
  UndefinedValidator,
  NullValidator,
  DateValidator,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  BigIntValidator,
  AnyValidator,
  OptionalValidator,
  AndValidator,
  OrValidator,
  OmitValidator,
  PartialValidator,
  PickValidator,
  IfValidator,
  InstanceOfValidator,
} from "./validators/mod.ts";

export type TErrorMessage = string | (() => string | Promise<string>);

export type inferInput<T> = T extends ObjectValidator<any, infer R, any>
  ? R
  : T extends RecordValidator<any, infer R, any>
  ? R
  : T extends ArrayValidator<any, infer R, any>
  ? R
  : T extends TupleValidator<any, infer R, any>
  ? R
  : T extends EnumValidator<any, infer R, any>
  ? R
  : T extends UndefinedValidator<any, infer R, any>
  ? R
  : T extends NullValidator<any, infer R, any>
  ? R
  : T extends DateValidator<any, infer R, any>
  ? R
  : T extends StringValidator<any, infer R, any>
  ? R
  : T extends NumberValidator<any, infer R, any>
  ? R
  : T extends BooleanValidator<any, infer R, any>
  ? R
  : T extends BigIntValidator<any, infer R, any>
  ? R
  : T extends AnyValidator<any, infer R, any>
  ? R
  : T extends OptionalValidator<any, infer R, any>
  ? R
  : T extends AndValidator<any, infer R, any>
  ? R
  : T extends OrValidator<any, infer R, any>
  ? R
  : T extends OmitValidator<any, infer R, any>
  ? R
  : T extends PartialValidator<any, infer R, any>
  ? R
  : T extends PickValidator<any, infer R, any>
  ? R
  : T extends IfValidator<any, infer R, any>
  ? R
  : T extends InstanceOfValidator<any, infer R, any>
  ? R
  : T extends BaseValidator<any, infer R, any>
  ? R
  : never;

export type inferOutput<T> = T extends ObjectValidator<any, any, infer R>
  ? R
  : T extends RecordValidator<any, any, infer R>
  ? R
  : T extends ArrayValidator<any, any, infer R>
  ? R
  : T extends TupleValidator<any, any, infer R>
  ? R
  : T extends EnumValidator<any, any, infer R>
  ? R
  : T extends UndefinedValidator<any, any, infer R>
  ? R
  : T extends NullValidator<any, any, infer R>
  ? R
  : T extends DateValidator<any, any, infer R>
  ? R
  : T extends StringValidator<any, any, infer R>
  ? R
  : T extends NumberValidator<any, any, infer R>
  ? R
  : T extends BooleanValidator<any, any, infer R>
  ? R
  : T extends BigIntValidator<any, any, infer R>
  ? R
  : T extends AnyValidator<any, any, infer R>
  ? R
  : T extends OptionalValidator<any, any, infer R>
  ? R
  : T extends AndValidator<any, any, infer R>
  ? R
  : T extends OrValidator<any, any, infer R>
  ? R
  : T extends OmitValidator<any, any, infer R>
  ? R
  : T extends PartialValidator<any, any, infer R>
  ? R
  : T extends PickValidator<any, any, infer R>
  ? R
  : T extends IfValidator<any, any, infer R>
  ? R
  : T extends InstanceOfValidator<any, any, infer R>
  ? R
  : T extends BaseValidator<any, any, infer R>
  ? R
  : never;

export type inferObjectInput<T> = {
  [key in keyof T]: inferInput<T[key]>;
};

export type inferObjectOutput<T> = {
  [key in keyof T]: inferOutput<T[key]>;
};

export type inferEachInput<T extends Array<any>> = {
  [K in keyof T]: inferInput<T[K]>;
};

export type inferEachOutput<T extends Array<any>> = {
  [K in keyof T]: inferOutput<T[K]>;
};
