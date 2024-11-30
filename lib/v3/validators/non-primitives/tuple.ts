// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../../exceptions.ts";
import type {
  inferEachInput,
  inferEachOutput,
  TErrorMessage,
} from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type IValidatorContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export interface ITupleValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<"typeError" | "smallerLength" | "greaterLength", TErrorMessage>
  >;

  /** Validate array minimum length */
  minLength?: number;

  /** Validate array maximum length */
  maxLength?: number;

  /**
   * Partialize the underlying validator (makes undefined values in the props acceptable)
   *
   * Use e.partial() instead, if working with typescript
   */
  partial?: boolean;

  /**
   * Converts the underlying validator's props that are partialized/optional to required
   *
   * Use e.required() instead, if working with typescript
   */
  required?: boolean;

  /**
   * (Casting Option) Requires `cast` to be `true`
   *
   * Set a splitter that will be used to split elements in the string and convert it into array during the cast.
   */
  splitter?: string | RegExp;
}

export class TupleValidator<
  Shape extends Array<
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>)
  >,
  Input extends [...any] = inferEachInput<Shape>,
  Output = inferEachOutput<Shape>,
> extends BaseValidator<Shape, Input, Output> {
  static tuple = TupleValidator.createFactory(TupleValidator);

  protected Validators: Shape;
  protected RestValidator?:
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>);

  protected overrideContext(ctx: any) {
    if (!ctx.validatorOptions) return ctx;

    return {
      ...ctx,
      ...(ctx.validatorOptions?.partial
        ? {
          options: {
            optional: true,
            noDefaults: ctx.validatorOptions.partialNoDefaults ?? false,
          },
          replaceOptions: ctx.validatorOptions.optionalOptions
            ? {
              optionalOptions: ctx.validatorOptions.optionalOptions,
            }
            : undefined,
        }
        : ctx.validatorOptions?.required
        ? { options: { optional: false } }
        : {}),
    };
  }

  protected override _toJSON(ctx?: IJSONSchemaContext<ITupleValidatorOptions>) {
    const RestValidator = this.RestValidator &&
      BaseValidator.resolveValidator(this.RestValidator);
    const Context = this.overrideContext(ctx);

    return {
      type: "array",
      description: BaseValidator.prepareDescription(
        ctx?.validatorOptions ?? {},
      ),
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      minLength: ctx?.validatorOptions?.minLength,
      maxLength: ctx?.validatorOptions?.maxLength,
      tuple: this.Validators.map((validator) =>
        BaseValidator.resolveValidator(validator).toJSON(
          Context,
        ).schema
      ).filter(Boolean),
      items: RestValidator?.toJSON(Context).schema,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(
    ctx?: ISampleDataContext<ITupleValidatorOptions>,
  ) {
    const Output = ([] as any[]) as Input;
    const Context = this.overrideContext(ctx);

    for (let i = 0; i < (ctx?.validatorOptions?.minLength ?? 1); i++) {
      const Validator = BaseValidator.resolveValidator(this.Validators[i]);
      const RestValidator = this.RestValidator &&
        BaseValidator.resolveValidator(this.RestValidator);

      Output.push(
        (Validator ?? RestValidator)?.toSample(Context).data,
      );
    }

    return this.Sample ?? Output.filter(Boolean);
  }

  protected override _toStatic(
    ctx?: IStaticContext<ITupleValidatorOptions>,
  ): TupleValidator<Shape, Input, Output> {
    const Context = this.overrideContext(ctx);
    const Validators = this.Validators.map((validator) =>
      BaseValidator.resolveValidator(validator).toStatic(
        Context,
      )
    );

    const Validator = TupleValidator.tuple(
      Validators as Shape,
      ctx?.validatorOptions,
    );

    if (this.RestValidator) {
      const RestValidator = BaseValidator.resolveValidator(this.RestValidator);
      Validator.rest(RestValidator.toStatic(Context));
    }

    return Validator as any;
  }

  protected override _cast(ctx: IValidatorContext<any, any>) {
    if (typeof ctx.output === "string") {
      try {
        ctx.output = JSON.parse(ctx.output);
      } catch {
        if (ctx.validatorOptions?.splitter) {
          ctx.output = ctx.output.toString().split(
            ctx.validatorOptions.splitter,
          );
        }
      }
    }
  }

  constructor(validators: [...Shape], options?: ITupleValidatorOptions) {
    super(ValidatorType.NON_PRIMITIVE, "tuple", options);

    if (!(validators instanceof Array)) {
      throw new Error("Invalid validators list has been provided!");
    }

    this.Validators = validators;
    this["ValidatorOptions"].minLength =
      this["ValidatorOptions"].maxLength =
        validators.length;

    this._custom(async (ctx) => {
      if (!(ctx.output instanceof Array)) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid array has been provided!",
        );
      }

      const MinLength = ctx.validatorOptions?.minLength ??
        this.Validators.length;

      if (ctx.output.length < MinLength) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.smallerLength,
          "Array is smaller than minimum length!",
        );
      }

      const MaxLength = ctx.validatorOptions?.maxLength ?? MinLength;

      if (!this.RestValidator || MaxLength > MinLength) {
        if (ctx.output.length > MaxLength) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.greaterLength,
            "Array is larger than maximum length!",
          );
        }
      }

      ctx.output = [...ctx.output];

      let Exception: ValidationException | undefined;

      const Context = this.overrideContext(ctx);

      for (const [Key, Value] of Object.entries(ctx.output)) {
        const Index = parseInt(Key);
        const Validator = BaseValidator.resolveValidator(
          this.Validators[Index] ?? this.RestValidator,
        );

        const Location = `${ctx.location}.${Key}`;

        try {
          ctx.output[Index] = await Validator.validate(Value, {
            ...Context,
            location: Location,
            index: Index,
            property: Key,
            parent: ctx,
            internal: true,
          });
        } catch (error) {
          if (!Exception) Exception = new ValidationException();

          Exception.pushIssues(error as Error);
        }
      }

      if (Exception?.issues.length) throw Exception;
    }, true);
  }

  public rest<
    Validator extends BaseValidator<any, any, any>,
    T extends Array<any> = [...Shape, ...Validator[]],
  >(
    validator: Validator | (() => Validator),
  ): TupleValidator<T, inferEachInput<T>, inferEachOutput<T>> {
    if (this.RestValidator) {
      throw new Error("A rest validator cannot follow another rest validator.");
    }

    this.RestValidator = validator;

    return this as any;
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object"
      ? options
      : { min: options, max: options };

    if (
      (Options.min ?? this["ValidatorOptions"].minLength) <
        this["ValidatorOptions"].minLength
    ) {
      throw new Error(
        `Minimum length cannot be smaller than the defined tuple schema length!`,
      );
    }

    if (
      (Options.max ?? this["ValidatorOptions"].maxLength) <
        this["ValidatorOptions"].maxLength
    ) {
      throw new Error(
        `Maximum length cannot be smaller than the defined tuple schema length!`,
      );
    }

    if (
      (Options.min ?? this["ValidatorOptions"].minLength) >
        this["ValidatorOptions"].minLength && !this.RestValidator
    ) {
      throw new Error(
        `If you want to set a greater min length, please set a rest validator on the tuple!`,
      );
    }

    if (
      (Options.max ?? this["ValidatorOptions"].maxLength) >
        this["ValidatorOptions"].maxLength && !this.RestValidator
    ) {
      throw new Error(
        `If you want to set a greater max length, please set a rest validator on the tuple!`,
      );
    }

    this["ValidatorOptions"].minLength = Options.min ??
      this["ValidatorOptions"].minLength;
    this["ValidatorOptions"].maxLength = Options.max ??
      this["ValidatorOptions"].maxLength;

    return this;
  }

  public min(length: number) {
    return this.length({ min: length });
  }

  public max(length: number) {
    return this.length({ max: length });
  }
}
