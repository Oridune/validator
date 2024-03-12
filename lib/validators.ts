// deno-lint-ignore-file no-explicit-any ban-types ban-unused-ignore ban-ts-comment
import {
  AndValidator,
  AnyValidator,
  ArrayValidator,
  BaseValidator,
  BigIntValidator,
  BooleanValidator,
  DateValidator,
  EnumValidator,
  IAndValidatorOptions,
  IAnyValidatorOptions,
  IArrayValidatorOptions,
  IBigIntValidatorOptions,
  IBooleanValidatorOptions,
  IDateValidatorOptions,
  IEnumValidatorOptions,
  IfValidator,
  IIfValidatorOptions,
  IInstanceOfValidatorOptions,
  InstanceOfValidator,
  INullValidatorOptions,
  INumberValidatorOptions,
  IObjectValidatorOptions,
  IOptionalValidatorOptions,
  IOrValidatorOptions,
  IRecordValidatorOptions,
  IStringValidatorOptions,
  ITupleValidatorOptions,
  IUndefinedValidatorOptions,
  IValidatorContext,
  NullValidator,
  NumberValidator,
  ObjectValidator,
  ObjectValidatorShape,
  OptionalValidator,
  OrValidator,
  RecordValidator,
  StringValidator,
  TupleValidator,
  UndefinedValidator,
} from "./validators/mod.ts";
import { IValidationIssue, ValidationException } from "./exceptions.ts";
import {
  DeepPartial,
  inferEachInput,
  inferEachOutput,
  inferInput,
  inferObjectInput,
  inferObjectOutput,
  inferOutput,
  OmitAdvance,
  PartialAdvance,
  PickAdvance,
  RequiredAdvance,
} from "./types.ts";

export type OverrideValidatorOptions =
  | Record<string, any>
  | ((validator: BaseValidator<any, any, any>) => Record<string, any> | void);

const Validators = {
  /**
   * Validate an object's schema. {name: "john", "age": 25}
   * @param shape Define the shape of your object.
   * @param options
   * @returns
   */
  object: <Shape extends object>(
    shape?: Shape,
    options?: IObjectValidatorOptions,
  ) =>
    new ObjectValidator<
      ObjectValidatorShape,
      inferObjectInput<Shape>,
      inferObjectOutput<Shape>
    >(shape || ({} as any), options),

  /**
   * Validate the schema of a record object. {foo: "bar", hello: "world"}
   * @param validator Pass a validator that is used to validate the value of record.
   * @param options
   * @returns
   */
  record: <
    Validator extends BaseValidator<any, any, any>,
    Index extends string | number | symbol = string,
  >(
    validator?: Validator | (() => Validator),
    options?: IRecordValidatorOptions,
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
  array: <Validator extends BaseValidator<any, any, any>>(
    validator?: Validator | (() => Validator),
    options?: IArrayValidatorOptions,
  ) =>
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
  tuple: <
    Validator extends Array<
      BaseValidator<any, any, any> | (() => BaseValidator<any, any, any>)
    >,
  >(
    validators: [...Validator],
    options?: ITupleValidatorOptions,
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
    options: IEnumValidatorOptions = {},
  ) => new EnumValidator<any, T, T>(list, options),

  /**
   * Validate if the value exists in the choice list. [items, ...].includes(value)
   * @param list An array of choices. ["pending", "processing", "completed", ...]
   * @param options
   * @returns
   */
  enum: <T extends string>(
    list: T[] | ((ctx: IValidatorContext) => T[] | Promise<T[]>),
    options: IEnumValidatorOptions = {},
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
    options: Omit<IBooleanValidatorOptions, "expected"> = {},
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
    options: Omit<IBooleanValidatorOptions, "expected"> = {},
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
  optional: <
    Validator extends
      | BaseValidator<any, any, any>
      | (() => BaseValidator<any, any, any>),
  >(
    validator: Validator,
    options?: IOptionalValidatorOptions,
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
  and: <
    A extends
      | BaseValidator<any, any, any>
      | (() => BaseValidator<any, any, any>),
    B extends
      | BaseValidator<any, any, any>
      | (() => BaseValidator<any, any, any>),
  >(
    a: A,
    b: B,
    options?: IAndValidatorOptions,
  ) =>
    new AndValidator<
      A | B,
      inferInput<A> & inferInput<B>,
      inferOutput<A> & inferOutput<B>
    >([a, b], options),

  /**
   * Make sure any of the provided validators accept the value.
   * @param validators A list of validators. [string, undefined, ...]
   * @param options
   * @returns
   */
  or: <
    Validator extends
      | BaseValidator<any, any, any>
      | (() => BaseValidator<any, any, any>),
  >(
    validators: Validator[],
    options?: IOrValidatorOptions,
  ) =>
    new OrValidator<Validator, inferInput<Validator>, inferOutput<Validator>>(
      validators,
      options,
    ),

  /**
   * Validate all the properties of an object except some...
   * @param validator An object validator.
   * @param options
   * @returns
   */
  omit: <
    Validator extends BaseValidator<ObjectValidatorShape, any, any>,
    Keys extends string,
    T = Validator extends BaseValidator<infer R, any, any> ? R : never,
    I = Validator extends BaseValidator<any, infer R, any> ? R : never,
    O = Validator extends BaseValidator<any, any, infer R> ? R : never,
  >(
    validator: Validator | (() => Validator),
    options: {
      keys: Keys[];
      validatorOptions?: OverrideValidatorOptions;
    },
  ) => {
    const TargetValidator = BaseValidator.resolveValidator(validator);

    if (!(TargetValidator instanceof ObjectValidator)) {
      throw new Error("Invalid object validator instance has been provided!");
    }

    const ClonedValidator = TargetValidator.clone();

    ClonedValidator["Shape"] = Object.entries(ClonedValidator["Shape"]).reduce(
      (shape, [key, value]) =>
        options.keys.includes(key as Keys) ? shape : { ...shape, [key]: value },
      {},
    );

    if (options?.validatorOptions) {
      ClonedValidator["Options"] = {
        ...ClonedValidator["Options"],
        ...(typeof options.validatorOptions === "function"
          ? options.validatorOptions(ClonedValidator)
          : options.validatorOptions),
      };
    }

    return ClonedValidator as ObjectValidator<
      T extends ObjectValidatorShape ? T : never,
      OmitAdvance<I, Keys extends keyof I ? Keys : never>,
      OmitAdvance<O, Keys extends keyof O ? Keys : never>
    >;
  },

  /**
   * Convert all the validators of each property of an object to optional.
   * @param validator An object validator.
   * @param options
   * @returns
   */
  partial: <
    Validator extends BaseValidator<ObjectValidatorShape, any, any>,
    Ignore extends string,
    T = Validator extends BaseValidator<infer R, any, any> ? R : never,
    I = Validator extends BaseValidator<any, infer R, any> ? R : never,
    O = Validator extends BaseValidator<any, any, infer R> ? R : never,
  >(
    validator: Validator | (() => Validator),
    options?: {
      ignore?: Ignore[];

      /**
       * By default the optional validators already defined are overridden. Set this property to `false` in order to keep the original optional validator settings.
       */
      overrideOptionalValidator?: boolean;
      validatorOptions?: OverrideValidatorOptions;
    } & IOptionalValidatorOptions,
  ) => {
    const TargetValidator = BaseValidator.resolveValidator(validator);

    if (!(TargetValidator instanceof ObjectValidator)) {
      throw new Error("Invalid object validator instance has been provided!");
    }

    const ClonedValidator = TargetValidator.clone();

    ClonedValidator["Shape"] = Object.entries(ClonedValidator["Shape"]).reduce(
      (shape, [key, value]) => ({
        ...shape,
        [key]: options?.ignore?.includes(key as Ignore) ||
            (options?.overrideOptionalValidator === false &&
              value instanceof OptionalValidator)
          ? value
          : Validators.optional(value as any, options),
      }),
      {},
    );

    if (options?.validatorOptions) {
      ClonedValidator["Options"] = {
        ...ClonedValidator["Options"],
        ...(typeof options.validatorOptions === "function"
          ? options.validatorOptions(ClonedValidator)
          : options.validatorOptions),
      };
    }

    return ClonedValidator as ObjectValidator<
      T extends ObjectValidatorShape ? T : never,
      PartialAdvance<I, Ignore extends keyof I ? Ignore : never>,
      PartialAdvance<O, Ignore extends keyof O ? Ignore : never>
    >;
  },

  /**
   * Deeply convert all the validators of each property of an object to optional.
   * @param validator An object validator.
   * @param options
   * @returns
   */
  deepPartial: <
    Validator extends BaseValidator<ObjectValidatorShape, any, any>,
    T = Validator extends BaseValidator<infer R, any, any> ? R : never,
    I = Validator extends BaseValidator<any, infer R, any> ? R : never,
    O = Validator extends BaseValidator<any, any, infer R> ? R : never,
  >(
    validator: Validator | (() => Validator),
    options?: IOptionalValidatorOptions & {
      ignoreKeys?: string[];

      /**
       * By default the optional validators already defined are overridden. Set this property to `false` in order to keep the original optional validator settings.
       */
      overrideOptionalValidator?: boolean;
      validatorOptions?: OverrideValidatorOptions;
      eachValidatorOptions?: OverrideValidatorOptions;
    },
  ) => {
    const IgnoreSet = new Set(options?.ignoreKeys);
    const TargetValidator = BaseValidator.resolveValidator(validator);

    if (!(TargetValidator instanceof ObjectValidator)) {
      throw new Error("Invalid object validator instance has been provided!");
    }

    const deepPartialValidator = (
      validator: BaseValidator<any, any, any>,
      keyPrefix?: string,
    ) => {
      if (validator["DeepPartialed"]) return validator;

      let Validator = validator;

      if (
        "Validator" in Validator &&
        Validator["Validator"] instanceof BaseValidator
      ) {
        Validator["Validator"] = deepPartialValidator(
          Validator["Validator"],
          keyPrefix,
        );
      }

      if (
        "RestValidator" in Validator &&
        Validator["RestValidator"] instanceof BaseValidator
      ) {
        Validator["RestValidator"] = deepPartialValidator(
          Validator["RestValidator"],
          keyPrefix,
        );
      }

      if (
        "Validators" in Validator && Validator["Validators"] instanceof Array
      ) {
        Validator["Validators"] = Validator["Validators"].map((validator) =>
          deepPartialValidator(validator, keyPrefix)
        );
      }

      if (validator instanceof ObjectValidator) {
        Validator = Validators.optional(
          deepPartialObjectValidator(validator, false, keyPrefix),
          options,
        );
      } else if (validator instanceof OptionalValidator) {
        Validator = options?.overrideOptionalValidator === false
          ? validator
          : Validators.optional(validator, options);
      } else Validator = Validators.optional(validator, options);

      Validator["DeepPartialed"] = true;

      if (options?.eachValidatorOptions) {
        Validator["Options"] = {
          ...Validator["Options"],
          ...(typeof options.eachValidatorOptions === "function"
            ? options.eachValidatorOptions(Validator)
            : options.eachValidatorOptions),
        };
      }

      return Validator;
    };

    const deepPartialObjectValidator = (
      validator: ObjectValidator<any, any, any>,
      start = false,
      keyPrefix?: string,
    ) => {
      if (validator["DeepPartialed"]) return validator;

      const Validator = validator.clone();

      const ValidatorShape = Validator["Shape"];

      for (const Key in ValidatorShape) {
        const Index = [keyPrefix, Key].filter(Boolean).join(".");

        if (!IgnoreSet.has(Index)) {
          ValidatorShape[Key] = deepPartialValidator(
            ValidatorShape[Key],
            Index,
          );
        }
      }

      Validator["DeepPartialed"] = true;

      if (start && options?.validatorOptions) {
        Validator["Options"] = {
          ...Validator["Options"],
          ...(typeof options.validatorOptions === "function"
            ? options.validatorOptions(Validator)
            : options.validatorOptions),
        };
      }

      return Validator;
    };

    return deepPartialObjectValidator(TargetValidator, true) as ObjectValidator<
      T extends ObjectValidatorShape ? T : never,
      DeepPartial<I>,
      DeepPartial<O>
    >;
  },

  /**
   * Deeply forces all validators to cast the value before validation.
   * @param validator Any validator can be passed.
   * @returns
   */
  deepCast: <Validator extends BaseValidator<any, any, any>>(
    validator: Validator | (() => Validator),
    options?: {
      validatorOptions?: OverrideValidatorOptions;
      eachValidatorOptions?: OverrideValidatorOptions;
    },
  ) => {
    const TargetValidator = BaseValidator.resolveValidator(validator);

    const castValidator = (
      validator: BaseValidator<any, any, any>,
      start = false,
    ) => {
      if (validator["DeepCasted"]) return validator;

      let Validator = validator;

      if (
        "Validator" in Validator &&
        Validator["Validator"] instanceof BaseValidator
      ) {
        Validator["Validator"] = castValidator(Validator["Validator"]);
      }

      if (
        "RestValidator" in Validator &&
        Validator["RestValidator"] instanceof BaseValidator
      ) {
        Validator["RestValidator"] = castValidator(Validator["RestValidator"]);
      }

      if (
        "Validators" in Validator && Validator["Validators"] instanceof Array
      ) {
        Validator["Validators"] = Validator["Validators"].map((validator) =>
          castValidator(validator)
        );
      }

      if (Validator instanceof ObjectValidator) {
        Validator = castObjectValidator(Validator);
      }

      Validator["Options"] ??= {};
      Validator["Options"].cast = true;

      if (start && options?.validatorOptions) {
        Validator["Options"] = {
          ...Validator["Options"],
          ...(typeof options.validatorOptions === "function"
            ? options.validatorOptions(Validator)
            : options.validatorOptions),
        };
      }

      if (options?.eachValidatorOptions) {
        Validator["Options"] = {
          ...Validator["Options"],
          ...(typeof options.eachValidatorOptions === "function"
            ? options.eachValidatorOptions(Validator)
            : options.eachValidatorOptions),
        };
      }

      Validator["DeepCasted"] = true;

      return Validator;
    };

    const castObjectValidator = (validator: ObjectValidator<any, any, any>) => {
      const ValidatorShape = validator["Shape"];

      for (const Key in ValidatorShape) {
        ValidatorShape[Key] = castValidator(ValidatorShape[Key]);
      }

      return validator;
    };

    return castValidator(TargetValidator, true) as Validator;
  },

  /**
   * Convert all the validators of each optional property of an object to required.
   * @param validator An object validator.
   * @param options
   * @returns
   */
  required: <
    Validator extends BaseValidator<ObjectValidatorShape, any, any>,
    Ignore extends string,
    T = Validator extends BaseValidator<infer R, any, any> ? R : never,
    I = Validator extends BaseValidator<any, infer R, any> ? R : never,
    O = Validator extends BaseValidator<any, any, infer R> ? R : never,
  >(
    validator: Validator | (() => Validator),
    options?: {
      ignore?: Ignore[];
      validatorOptions?: OverrideValidatorOptions;
    },
  ) => {
    const TargetValidator = BaseValidator.resolveValidator(validator);

    if (!(TargetValidator instanceof ObjectValidator)) {
      throw new Error("Invalid object validator instance has been provided!");
    }

    const ClonedValidator = TargetValidator.clone();

    ClonedValidator["Shape"] = Object.entries(ClonedValidator["Shape"]).reduce(
      (shape, [key, value]) => ({
        ...shape,
        [key]: options?.ignore?.includes(key as Ignore)
          ? value
          : value instanceof OptionalValidator
          ? value["Validator"]
          : value,
      }),
      {},
    );

    if (options?.validatorOptions) {
      ClonedValidator["Options"] = {
        ...ClonedValidator["Options"],
        ...(typeof options.validatorOptions === "function"
          ? options.validatorOptions(ClonedValidator)
          : options.validatorOptions),
      };
    }

    return ClonedValidator as ObjectValidator<
      T extends ObjectValidatorShape ? T : never,
      RequiredAdvance<I, Ignore extends keyof I ? Ignore : never>,
      RequiredAdvance<O, Ignore extends keyof O ? Ignore : never>
    >;
  },

  /**
   * Validate some specific properties of an object.
   * @param validator An object validator.
   * @param options
   * @returns
   */
  pick: <
    Validator extends BaseValidator<ObjectValidatorShape, any, any>,
    Keys extends string,
    T = Validator extends BaseValidator<infer R, any, any> ? R : never,
    I = Validator extends BaseValidator<any, infer R, any> ? R : never,
    O = Validator extends BaseValidator<any, any, infer R> ? R : never,
  >(
    validator: Validator | (() => Validator),
    options?: {
      keys?: Keys[];
      validatorOptions?: OverrideValidatorOptions;
    },
  ) => {
    const TargetValidator = BaseValidator.resolveValidator(validator);

    if (!(TargetValidator instanceof ObjectValidator)) {
      throw new Error("Invalid object validator instance has been provided!");
    }

    const ClonedValidator = TargetValidator.clone();

    ClonedValidator["Shape"] = Object.entries(ClonedValidator["Shape"]).reduce(
      (shape, [key, value]) =>
        options?.keys?.includes(key as Keys)
          ? { ...shape, [key]: value }
          : shape,
      {},
    );

    if (options?.validatorOptions) {
      ClonedValidator["Options"] = {
        ...ClonedValidator["Options"],
        ...(typeof options.validatorOptions === "function"
          ? options.validatorOptions(ClonedValidator)
          : options.validatorOptions),
      };
    }

    return ClonedValidator as ObjectValidator<
      T extends ObjectValidatorShape ? T : never,
      PickAdvance<I, Keys extends keyof I ? Keys : never>,
      PickAdvance<O, Keys extends keyof O ? Keys : never>
    >;
  },

  /**
   * Validate if the value matches the predicate
   * @param predicate `boolean` or a function that accepts the value and context in the first two arguments and returns a `boolean`
   * @param options
   * @returns
   */
  if: <T = any>(
    predicate:
      | boolean
      | ((value: T, ...arg: any[]) => boolean | Promise<boolean>),
    options?: IIfValidatorOptions,
  ) => new IfValidator<unknown, T, T>(predicate, options),

  /**
   * Validate if value is an instanceof a specific constructor
   * @param constructor
   * @param options
   * @returns
   */
  instanceOf: <
    T extends new (...args: any[]) => any,
    AllowUndefined extends boolean = false,
    Proto = T extends { prototype: any } ? T["prototype"] : unknown,
    RawInput = ConstructorParameters<T>[0],
    Input = AllowUndefined extends true ? RawInput | undefined
      : Exclude<RawInput, undefined>,
    RestArgs = ConstructorParameters<T> extends [any, ...infer R] ? R : never,
  >(
    constructor: T,
    options?: IInstanceOfValidatorOptions<
      AllowUndefined,
      Input,
      RestArgs extends Array<any> ? RestArgs : never
    >,
  ) => new InstanceOfValidator<T, Proto | Input, Proto>(constructor, options),

  /**
   * Validate a URL.
   * @param options String validation options.
   * @returns
   */
  url: <URLInstance extends boolean = false>(
    options?: IStringValidatorOptions & { returnURLInstance?: URLInstance },
  ) => Validators.string(options).isURL(options?.returnURLInstance),

  /**
   * Add an error to the validator.
   * @param message Message of the error.
   * @param location Path to a specific field where the error occured.
   * @param input Input value that is causing the error.
   */
  error: (
    message: string | Error | ValidationException,
    location?: string,
    input?: any,
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

  /**
   * Check if the value passes the validation and returns a `boolean`
   * @param validator Any validator can be passed
   * @param value Target value to be validated
   * @returns
   */
  is: (
    validator:
      | BaseValidator<any, any, any>
      | (() => BaseValidator<any, any, any>),
    value: unknown,
  ) => {
    return BaseValidator.resolveValidator(validator)
      .validate(value)
      .then(() => true)
      .catch(() => false);
  },
};

export default Validators;
