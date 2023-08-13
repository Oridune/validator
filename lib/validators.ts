// deno-lint-ignore-file no-explicit-any ban-types ban-unused-ignore
import {
  inferEachInput,
  inferEachOutput,
  inferInput,
  inferOutput,
  IValidatorContext,
} from "./validators/base.ts";
import {
  inferObjectInput,
  inferObjectOutput,
  IObjectValidatorOptions,
  ObjectValidator,
} from "./validators/non-primitives/object.ts";
import {
  IRecordValidatorOptions,
  RecordValidator,
} from "./validators/non-primitives/record.ts";
import {
  ArrayValidator,
  IArrayValidatorOptions,
} from "./validators/non-primitives/array.ts";
import {
  ITupleValidatorOptions,
  TupleValidator,
} from "./validators/non-primitives/tuple.ts";
import {
  EnumValidator,
  IEnumValidatorOptions,
} from "./validators/non-primitives/enum.ts";
import {
  IUndefinedValidatorOptions,
  UndefinedValidator,
} from "./validators/primitives/undefined.ts";
import {
  INullValidatorOptions,
  NullValidator,
} from "./validators/primitives/null.ts";
import {
  IDateValidatorOptions,
  DateValidator,
} from "./validators/non-primitives/date.ts";
import {
  IStringValidatorOptions,
  StringValidator,
} from "./validators/primitives/string.ts";
import {
  INumberValidatorOptions,
  NumberValidator,
} from "./validators/primitives/number.ts";
import {
  BooleanValidator,
  IBooleanValidatorOptions,
} from "./validators/primitives/boolean.ts";
import {
  BigIntValidator,
  IBigIntValidatorOptions,
} from "./validators/primitives/bigint.ts";
import {
  AnyValidator,
  IAnyValidatorOptions,
} from "./validators/utility/any.ts";
import {
  IOptionalValidatorOptions,
  OptionalValidator,
} from "./validators/utility/optional.ts";
import {
  AndValidator,
  IAndValidatorOptions,
} from "./validators/utility/and.ts";
import { IOrValidatorOptions, OrValidator } from "./validators/utility/or.ts";
import { IValidationIssue, ValidationException } from "./exceptions.ts";
import {
  IOmitValidatorOptions,
  OmitAdvance,
  OmitValidator,
} from "./validators/utility/omit.ts";
import {
  IPartialValidatorOptions,
  PartialAdvance,
  PartialValidator,
} from "./validators/utility/partial.ts";
import {
  IPickValidatorOptions,
  PickAdvance,
  PickValidator,
} from "./validators/utility/pick.ts";

const Validators = {
  /**
   * Validate an object's schema. {name: "john", "age": 25}
   * @param shape Define the shape of your object.
   * @param options
   * @returns
   */
  object: <Shape extends object>(
    shape?: Shape,
    options?: IObjectValidatorOptions
  ) =>
    new ObjectValidator<
      ObjectConstructor,
      inferObjectInput<Shape>,
      inferObjectOutput<Shape>
    >(shape || ({} as any), options),

  /**
   * Validate the schema of a record object. {foo: "bar", hello: "world"}
   * @param validator Pass a validator that is used to validate the value of record.
   * @param options
   * @returns
   */
  record: <Validator, Index extends string | number | symbol = string>(
    validator?: Validator,
    options?: IRecordValidatorOptions
  ) =>
    new RecordValidator<
      Validator,
      Record<Index, inferInput<Validator>>,
      Record<Index, inferOutput<Validator>>
    >(validator, options),

  /**
   * Validate an Array datatype. [elements, ...]
   * @param validator Pass a validator to validate each element of the array.
   * @param options
   * @returns
   */
  array: <Validator>(validator?: Validator, options?: IArrayValidatorOptions) =>
    new ArrayValidator<
      Validator,
      inferInput<Validator>[],
      inferOutput<Validator>[]
    >(validator, options),

  /**
   * Validate a tuple data. [value1, value2, ...]
   * @param validators A list of validators to validate each element in the array in a sequence with its own specific validator.
   * @param options
   * @returns
   */
  tuple: <Validator extends Array<any>>(
    validators: [...Validator],
    options?: ITupleValidatorOptions
  ) =>
    new TupleValidator<
      Validator,
      inferEachInput<Validator>,
      inferEachOutput<Validator>
    >(validators, options),

  /**
   * Validate if the value exists in the choice list. [items, ...].includes(value)
   * @param list An array of choices. ["pending", "processing", "completed", ...]
   * @param options
   * @returns
   */
  in: <T>(
    list: T[] | ((ctx: IValidatorContext) => T[] | Promise<T[]>),
    options: IEnumValidatorOptions = {}
  ) => new EnumValidator<any, T, T>(list, options),

  /**
   * Validate if the value exists in the choice list. [items, ...].includes(value)
   * @param list An array of choices. ["pending", "processing", "completed", ...]
   * @param options
   * @returns
   */
  enum: <T extends string>(
    list: T[] | ((ctx: IValidatorContext) => T[] | Promise<T[]>),
    options: IEnumValidatorOptions = {}
  ) => new EnumValidator<any, T, T>(list, options),

  /**
   * Make sure the input value is undefined.
   * @param options
   * @returns
   */
  undefined: <T extends undefined>(options?: IUndefinedValidatorOptions) =>
    new UndefinedValidator<undefined, T, T>(options),

  /**
   * Make sure the input value is null.
   * @param options
   * @returns
   */
  null: <T extends null>(options?: INullValidatorOptions) =>
    new NullValidator<null, T, T>(options),

  /**
   * Make sure the input value is a date.
   * @param options
   * @returns
   */
  date: <T extends Date>(options?: IDateValidatorOptions) =>
    new DateValidator<null, T, T>(options),

  /**
   * Validate a string value
   * @param options
   * @returns
   */
  string: <T extends string>(options?: IStringValidatorOptions) =>
    new StringValidator<StringConstructor, T, T>(options),

  /**
   * Validate a number value
   * @param options
   * @returns
   */
  number: <T extends number>(options?: INumberValidatorOptions) =>
    new NumberValidator<NumberConstructor, T, T>(options),

  /**
   * Validate a boolean value
   * @param options
   * @returns
   */
  boolean: <T extends boolean>(options?: IBooleanValidatorOptions) =>
    new BooleanValidator<BooleanConstructor, T, T>(options),

  /**
   * Make sure the value is true
   * @param options
   * @returns
   */
  true: <T extends true>(
    options: Omit<IBooleanValidatorOptions, "expected"> = {}
  ) =>
    new BooleanValidator<BooleanConstructor, T, T>({
      ...options,
      expected: true,
    }),

  /**
   * Make sure the value is false
   * @param options
   * @returns
   */
  false: <T extends false>(
    options: Omit<IBooleanValidatorOptions, "expected"> = {}
  ) =>
    new BooleanValidator<BooleanConstructor, T, T>({
      ...options,
      expected: false,
    }),

  /**
   * Validate a bigint value
   * @param options
   * @returns
   */
  bigint: <T extends bigint>(options?: IBigIntValidatorOptions) =>
    new BigIntValidator<BigIntConstructor, T, T>(options),

  /**
   * Any value would pass this validator.
   * @param options
   * @returns
   */
  any: (options: IAnyValidatorOptions = {}) =>
    new AnyValidator<any, any, any>(options),

  /**
   * Provide a default value.
   * @param value Any value is allowed.
   * @param options
   * @returns
   */
  value: <Value>(value: Value, options: IAnyValidatorOptions = {}) =>
    Validators.any(options).custom(() => value) as AnyValidator<
      any,
      unknown,
      Value
    >,

  /**
   * Converts a validator to accept optional values.
   * @param validator Any kind of validator.
   * @param options
   * @returns
   */
  optional: <Validator>(
    validator: Validator,
    options?: IOptionalValidatorOptions
  ) =>
    new OptionalValidator<
      Validator,
      inferInput<Validator> | undefined,
      inferOutput<Validator> | undefined
    >(validator, options),

  /**
   * Make sure all the provided validators accept the value.
   * @param validators A list of validators. [string, number({cast: true}), ...]
   * @param options
   * @returns
   */
  and: <Validator>(validators: Validator[], options?: IAndValidatorOptions) =>
    new AndValidator<Validator, inferInput<Validator>, inferOutput<Validator>>(
      validators,
      options
    ),

  /**
   * Make sure any of the provided validators accept the value.
   * @param validators A list of validators. [string, undefined, ...]
   * @param options
   * @returns
   */
  or: <Validator>(validators: Validator[], options?: IOrValidatorOptions) =>
    new OrValidator<Validator, inferInput<Validator>, inferOutput<Validator>>(
      validators,
      options
    ),

  /**
   * Validate all the properties of an object except some...
   * @param validator An object validator.
   * @param options
   * @returns
   */
  omit: <Validator extends ObjectValidator<any, any, any>, Keys extends string>(
    validator: Validator,
    options: IOmitValidatorOptions<Keys> = {}
  ) =>
    new OmitValidator<
      Validator,
      OmitAdvance<inferInput<Validator>, Keys>,
      OmitAdvance<inferOutput<Validator>, Keys>
    >(validator, options),

  /**
   * Convert all the validators of each property of an object to optional.
   * @param validator An object validator.
   * @param options
   * @returns
   */
  partial: <
    Validator extends ObjectValidator<any, any, any>,
    Ignore extends string
  >(
    validator: Validator,
    options: IPartialValidatorOptions<Ignore> = {}
  ) =>
    new PartialValidator<
      Validator,
      PartialAdvance<inferInput<Validator>, Ignore>,
      PartialAdvance<inferOutput<Validator>, Ignore>
    >(validator, options),

  /**
   * Validate some specific properties of an object.
   * @param validator An object validator.
   * @param options
   * @returns
   */
  pick: <Validator extends ObjectValidator<any, any, any>, Keys extends string>(
    validator: Validator,
    options: IPickValidatorOptions<Keys> = {}
  ) =>
    new PickValidator<
      Validator,
      PickAdvance<inferInput<Validator>, Keys>,
      PickAdvance<inferOutput<Validator>, Keys>
    >(validator, options),

  /**
   * Add an error to the validator.
   * @param message Message of the error.
   * @param location Path to a specific field where the error occured.
   * @param input Input value that is causing the error.
   */
  error: (
    message: string | Error | ValidationException,
    location?: string,
    input?: any
  ) => {
    if (message instanceof ValidationException) throw message;
    throw new ValidationException("Validation Error!").pushIssues({
      message: message instanceof Error ? message.message : message,
      location,
      input,
    });
  },

  /**
   * Add multiple errors to the validator.
   * @param issues An array of issues.
   */
  errors: (issues: IValidationIssue[]) => {
    throw new ValidationException("Validation Error!").pushIssues(...issues);
  },

  /**
   * Try to execute a callback and convert possible error to a validation error.
   * @param callback Callback function to be executed.
   */
  try: async <T>(callback: () => T) => {
    try {
      const Results = await callback();
      return Results;
    } catch (error) {
      throw Validators.error(error);
    }
  },

  /**
   * Try to execute a synchronous callback and convert possible error to a validation error.
   * @param callback Callback function to be executed.
   */
  trySync: <T>(callback: () => T) => {
    try {
      const Results = callback();
      return Results;
    } catch (error) {
      throw Validators.error(error);
    }
  },
};

export default Validators;
