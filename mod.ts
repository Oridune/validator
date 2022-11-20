// deno-lint-ignore-file no-explicit-any ban-types
/**
 * Name: Epic Validator
 * Author: Saif Ali Khan
 * License: MIT
 *
 */

export * from "./lib/exceptions.ts";
export * from "./lib/validators/base.ts";
export * from "./lib/validators/string.ts";
export * from "./lib/validators/in.ts";
export * from "./lib/validators/number.ts";
export * from "./lib/validators/boolean.ts";
export * from "./lib/validators/array.ts";
export * from "./lib/validators/object.ts";

import { IValidationIssue, ValidationException } from "./lib/exceptions.ts";
import {
  inferInput,
  inferEachInput,
  inferOutput,
  inferEachOutput,
  IValidationContext,
} from "./lib/validators/base.ts";
import { AnyValidator, AnyValidatorOptions } from "./lib/validators/any.ts";
import {
  OptionalValidator,
  OptionalValidatorOptions,
} from "./lib/validators/optional.ts";
import {
  PartialValidator,
  PartialValidatorOptions,
} from "./lib/validators/partial.ts";
import { OmitValidator, OmitValidatorOptions } from "./lib/validators/omit.ts";
import { PickValidator, PickValidatorOptions } from "./lib/validators/pick.ts";
import { OrValidator, OrValidatorOptions } from "./lib/validators/or.ts";
import {
  inferObjectInput,
  inferObjectOutput,
  ObjectValidator,
  ObjectValidatorOptions,
} from "./lib/validators/object.ts";
import {
  RecordValidator,
  RecordValidatorOptions,
} from "./lib/validators/record.ts";
import {
  ArrayValidator,
  ArrayValidatorOptions,
} from "./lib/validators/array.ts";
import {
  TupleValidator,
  TupleValidatorOptions,
} from "./lib/validators/tuple.ts";
import {
  StringValidator,
  StringValidatorOptions,
} from "./lib/validators/string.ts";
import { InValidator, InValidatorOptions } from "./lib/validators/in.ts";
import {
  NumberValidator,
  NumberValidatorOptions,
} from "./lib/validators/number.ts";
import {
  BooleanValidator,
  BooleanValidatorOptions,
} from "./lib/validators/boolean.ts";

export type PartialAdvance<T, I extends string | number | symbol> = {
  [P in Exclude<keyof T, I>]?: T[P];
} & (I extends keyof T ? { [K in I]: T[I] } : { [P in keyof T]?: T[P] });

export type OmitAdvance<
  T,
  K extends string | number | symbol
> = K extends keyof T ? { [P in Exclude<keyof T, K>]: T[P] } : T;

export type PickAdvance<
  T,
  K extends string | number | symbol
> = K extends keyof T ? { [P in K]: T[P] } : {};

const Validators = {
  any: (options: AnyValidatorOptions = {}) =>
    new AnyValidator<any, any, any>(options),

  value: <Value>(value: Value, options: AnyValidatorOptions = {}) =>
    Validators.any(options).custom(() => value) as AnyValidator<
      any,
      unknown,
      Value
    >,

  optional: <Validator>(
    validator: Validator,
    options: OptionalValidatorOptions = {}
  ) =>
    new OptionalValidator<
      Validator,
      inferInput<Validator> | undefined,
      inferOutput<Validator> | undefined
    >(validator, options),

  partial: <
    Validator extends ObjectValidator<any, any, any>,
    Ignore extends string
  >(
    validator: Validator,
    options: PartialValidatorOptions<Ignore> = {}
  ) =>
    new PartialValidator<
      Validator,
      PartialAdvance<inferInput<Validator>, Ignore>,
      PartialAdvance<inferOutput<Validator>, Ignore>
    >(validator, options),

  omit: <Validator extends ObjectValidator<any, any, any>, Keys extends string>(
    validator: Validator,
    options: OmitValidatorOptions<Keys> = {}
  ) =>
    new OmitValidator<
      Validator,
      OmitAdvance<inferInput<Validator>, Keys>,
      OmitAdvance<inferOutput<Validator>, Keys>
    >(validator, options),

  pick: <Validator extends ObjectValidator<any, any, any>, Keys extends string>(
    validator: Validator,
    options: PickValidatorOptions<Keys> = {}
  ) =>
    new PickValidator<
      Validator,
      PickAdvance<inferInput<Validator>, Keys>,
      PickAdvance<inferOutput<Validator>, Keys>
    >(validator, options),

  or: <Validator>(validators: Validator[], options: OrValidatorOptions = {}) =>
    new OrValidator<Validator, inferInput<Validator>, inferOutput<Validator>>(
      validators,
      options
    ),

  object: <Shape extends object>(
    shape?: Shape,
    options: ObjectValidatorOptions = {}
  ) =>
    new ObjectValidator<
      Shape,
      inferObjectInput<Shape>,
      inferObjectOutput<Shape>
    >(shape || ({} as any), options),

  record: <Validator>(
    validator?: Validator,
    options: RecordValidatorOptions = {}
  ) =>
    new RecordValidator<
      Validator,
      Record<string, inferInput<Validator>>,
      Record<string, inferOutput<Validator>>
    >(validator, options),

  array: <Validator>(
    validator?: Validator,
    options: ArrayValidatorOptions = {}
  ) =>
    new ArrayValidator<
      Validator,
      inferInput<Validator>[],
      inferOutput<Validator>[]
    >(validator, options),

  tuple: <Validator extends Array<any>>(
    validators: [...Validator],
    options: TupleValidatorOptions = {}
  ) =>
    new TupleValidator<
      Validator,
      inferEachInput<Validator>,
      inferEachOutput<Validator>
    >(validators, options),

  string: <T extends string>(options: StringValidatorOptions = {}) =>
    new StringValidator<StringConstructor, T, T>(options),

  in: <T>(
    list: T[] | ((ctx: IValidationContext) => T[]),
    options: InValidatorOptions = {}
  ) => new InValidator<any, T, T>(list, options),

  enum: <T extends string>(
    list: T[] | ((ctx: IValidationContext) => T[]),
    options: InValidatorOptions = {}
  ) => new InValidator<any, T, T>(list, options),

  number: <T extends number>(options: NumberValidatorOptions = {}) =>
    new NumberValidator<NumberConstructor, T, T>(options),

  boolean: <T extends boolean>(options: BooleanValidatorOptions = {}) =>
    new BooleanValidator<BooleanConstructor, T, T>(options),

  true: <T extends true>(
    options: Omit<BooleanValidatorOptions, "expected"> = {}
  ) =>
    new BooleanValidator<BooleanConstructor, T, T>({
      ...options,
      expected: true,
    }),

  false: <T extends false>(
    options: Omit<BooleanValidatorOptions, "expected"> = {}
  ) =>
    new BooleanValidator<BooleanConstructor, T, T>({
      ...options,
      expected: false,
    }),

  error: (message: string, location?: string, input?: any) => {
    throw new ValidationException("Validation Error!").pushIssues({
      message,
      location,
      input,
    });
  },

  errors: (issues: IValidationIssue[]) => {
    throw new ValidationException("Validation Error!").pushIssues(...issues);
  },
};

export default Validators;
