import { type IValidationIssue, ValidationException } from "../exceptions.ts";
import {
  AndValidator,
  AnyValidator,
  ArrayValidator,
  BaseValidator,
  BigIntValidator,
  BooleanValidator,
  CastValidator,
  DateValidator,
  DeepPartialValidator,
  DeepRequiredValidator,
  EnumValidator,
  IfValidator,
  InstanceOfValidator,
  NullValidator,
  NumberValidator,
  ObjectValidator,
  OmitValidator,
  OptionalValidator,
  OrValidator,
  PartialValidator,
  PickValidator,
  RecordValidator,
  RequiredValidator,
  StringValidator,
  TupleValidator,
  UndefinedValidator,
} from "./validators/mod.ts";
import { DeepOptionsValidator } from "./validators/utility/deepOptions.ts";

export class Validators {
  /**
   * Validate a bigint value
   * @param options
   * @returns
   */
  static bigint = BigIntValidator.bigint;

  /**
   * Validate a boolean value
   * @param options
   * @returns
   */
  static boolean = BooleanValidator.boolean;

  /**
   * Validate a true value
   * @param options
   * @returns
   */
  static true = BooleanValidator.true;

  /**
   * Validate a false value
   * @param options
   * @returns
   */
  static false = BooleanValidator.false;

  /**
   * Make sure the input value is null.
   * @param options
   * @returns
   */
  static null = NullValidator.null;

  /**
   * Validate a number value
   * @param options
   * @returns
   */
  static number = NumberValidator.number;

  /**
   * Validate a string value
   * @param options
   * @returns
   */
  static string = StringValidator.string;

  /**
   * Make sure the input value is undefined.
   * @param options
   * @returns
   */
  static undefined = UndefinedValidator.undefined;

  /**
   * Validate an Array datatype. [elements, ...]
   * @param validator Pass a validator to validate each element of the array.
   * @param options
   * @returns
   */
  static array = ArrayValidator.array;

  /**
   * Make sure the input value is a date.
   * @param options
   * @returns
   */
  static date = DateValidator.date;

  /**
   * Validate if the value exists in the choice list. [items, ...].includes(value)
   * @param list An array of choices. ["pending", "processing", "completed", ...]
   * @param options
   * @returns
   */
  static enum = EnumValidator.enum;

  /**
   * Validate if the value exists in the choice list. [items, ...].includes(value)
   * @param list An array of choices. ["pending", "processing", "completed", ...]
   * @param options
   * @returns
   */
  static in = Validators.enum;

  /**
   * Validate an object's schema. {name: "john", "age": 25}
   * @param shape Define the shape of your object.
   * @param options
   * @returns
   */
  static object = ObjectValidator.object;

  /**
   * Validate the schema of a record object. {foo: "bar", hello: "world"}
   * @param validator Pass a validator that is used to validate the value of record.
   * @param options
   * @returns
   */
  static record = RecordValidator.record;

  /**
   * Validate a tuple data. [value1, value2, ...]
   * @param validators A list of validators to validate each element in the array in a sequence with its own specific validator.
   * @param options
   * @returns
   */
  static tuple = TupleValidator.tuple;

  /**
   * Make sure all the provided validators accept the value.
   * @param validators A list of validators. [string, number({cast: true}), ...]
   * @param options
   * @returns
   */
  static and = AndValidator.and;

  /**
   * Any value would pass this validator.
   * @param options
   * @returns
   */
  static any = AnyValidator.any;

  /**
   * Provide a default value.
   * @param value Any value is allowed.
   * @param options
   * @returns
   */
  static value = AnyValidator.value;

  /**
   * Validate a literal value.
   * @param value Any value as a literal is allowed.
   * @param options
   * @returns
   */
  static literal = AnyValidator.literal;

  /**
   * Validate if the value matches the predicate
   * @param predicate `boolean` or a function that accepts the value and context in the first two arguments and returns a `boolean`
   * @param options
   * @returns
   */
  static if = IfValidator.if;

  /**
   * Validate if value is an instanceof a specific constructor
   * @param constructor
   * @param options
   * @returns
   */
  static instanceOf = InstanceOfValidator.instanceOf;

  /**
   * Converts a validator to accept optional values.
   * @param validator Any kind of validator.
   * @param options
   * @returns
   */
  static optional = OptionalValidator.optional;

  /**
   * Make sure any of the provided validators accept the value.
   * @param validators A list of validators. [number, undefined, ..., string]
   * @param options
   * @returns
   */
  static or = OrValidator.or;

  /**
   * Pass deep options to the validators
   * @param validators Any kind of validator or deep validators.
   * @param options
   * @returns
   */
  static deepOptions = DeepOptionsValidator.deepOptions;

  /**
   * Passed validator(s) will try to cast the data type of the value before validating.
   * @param validators Any kind of validator.
   * @param options
   * @returns
   */
  static cast = CastValidator.cast;

  /**
   * Passed validators will try to cast the data type of each value deeply before validating.
   * @param validators Any kind of validator or deep validators.
   * @param options
   * @returns
   */
  static deepCast = CastValidator.deepCast;

  /**
   * Passed validator will be partialized.
   * @param validator Any kind of validator.
   * @param options
   * @returns
   */
  static partial = PartialValidator.partial;

  /**
   * Passed validator will be partialized deeply.
   * @param validators Any kind of validator or deep validators.
   * @param options
   * @returns
   */
  static deepPartial = DeepPartialValidator.deepPartial;

  /**
   * Passed validator will be required.
   * @param validator Any kind of validator.
   * @param options
   * @returns
   */
  static required = RequiredValidator.required;

  /**
   * Passed validator will be required deeply.
   * @param validators Any kind of validator or deep validators.
   * @param options
   * @returns
   */
  static deepRequired = DeepRequiredValidator.deepRequired;

  /**
   * Omit some properties of a passed Object validator.
   * @param validator An Object validator.
   * @param options
   * @returns
   */
  static omit = OmitValidator.omit;

  /**
   * Pick some properties of a passed Object validator.
   * @param validator An Object validator.
   * @param options
   * @returns
   */
  static pick = PickValidator.pick;

  /**
   * Validate a URL.
   * @param options String validation options.
   * @returns
   */
  static url = StringValidator.url;

  /**
   * Add an error to the validator.
   * @param message Message of the error.
   * @param location Path to a specific field where the error occurred.
   * @param input Input value that is causing the error.
   */
  static error = (
    message: string | Error | ValidationException,
    location?: string,
    input?: unknown,
  ) => {
    if (message instanceof ValidationException) throw message;
    throw new ValidationException("Validation Error!").pushIssues({
      message: message instanceof Error ? message.message : message,
      location,
      input,
    });
  };

  /**
   * Add multiple errors to the validator.
   * @param issues An array of issues.
   */
  static errors = (issues: IValidationIssue[]) => {
    throw new ValidationException("Validation Error!").pushIssues(...issues);
  };

  /**
   * Try to execute a callback and convert possible error to a validation error.
   * @param callback Callback function to be executed.
   */
  static try = async <T>(callback: () => T) => {
    try {
      const Results = await callback();
      return Results;
    } catch (error) {
      throw Validators.error(error as Error);
    }
  };

  /**
   * Try to execute a synchronous callback and convert possible error to a validation error.
   * @param callback Callback function to be executed.
   */
  static trySync = <T>(callback: () => T) => {
    try {
      const Results = callback();
      return Results;
    } catch (error) {
      throw Validators.error(error as Error);
    }
  };

  /**
   * Check if the value passes the validation and returns a `boolean`
   * @param validator Any validator can be passed
   * @param value Target value to be validated
   * @returns
   */
  static is = (
    validator:
      | BaseValidator
      | (() => BaseValidator),
    value: unknown,
  ) =>
    BaseValidator.resolveValidator(validator)
      .validate(value)
      .then(() => true)
      .catch(() => false);
}

export default Validators;
