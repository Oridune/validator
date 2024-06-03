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
  partial?: boolean;
  required?: boolean;

  splitter?: string | RegExp;
  messages?: Partial<
    Record<"typeError" | "smallerLength" | "greaterLength", TErrorMessage>
  >;
  minLength?: number;
  maxLength?: number;
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
    return {
      ...ctx,
      ...(ctx.validatorOptions?.partial
        ? { options: { optional: true } }
        : ctx.validatorOptions?.required
        ? { options: { optional: false } }
        : {}),
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<ITupleValidatorOptions>) {
    const RestValidator = this.RestValidator &&
      BaseValidator.resolveValidator(this.RestValidator);

    return {
      type: "array",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      minLength: ctx?.validatorOptions?.minLength,
      maxLength: ctx?.validatorOptions?.maxLength,
      tuple: this.Validators.map((validator) =>
        BaseValidator.resolveValidator(validator).toJSON(
          this.overrideContext(ctx),
        ).schema
      ).filter(Boolean),
      items: RestValidator?.toJSON(this.overrideContext(ctx)).schema,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(ctx?: ISampleDataContext<ITupleValidatorOptions>) {
    const Output = ([] as any[]) as Input;

    for (let i = 0; i < (ctx?.validatorOptions?.minLength ?? 1); i++) {
      const Validator = BaseValidator.resolveValidator(this.Validators[i]);
      const RestValidator = this.RestValidator &&
        BaseValidator.resolveValidator(this.RestValidator);

      Output.push(
        (Validator ?? RestValidator)?.toSample(this.overrideContext(ctx)).data,
      );
    }

    return this.Sample ?? Output.filter(Boolean);
  }

  protected _toStatic(
    ctx?: IStaticContext<ITupleValidatorOptions>,
  ): TupleValidator<Shape, Input, Output> {
    const Validators = this.Validators.map((validator) =>
      BaseValidator.resolveValidator(validator).toStatic(
        this.overrideContext(ctx),
      )
    );

    const Validator = TupleValidator.tuple(
      Validators as Shape,
      ctx?.validatorOptions,
    );

    if (this.RestValidator) {
      const RestValidator = BaseValidator.resolveValidator(this.RestValidator);
      Validator.rest(RestValidator.toStatic(this.overrideContext(ctx)));
    }

    return Validator as any;
  }

  protected _cast(ctx: IValidatorContext<any, any>) {
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
    super(ValidatorType.NON_PRIMITIVE, options);

    if (!(validators instanceof Array)) {
      throw new Error("Invalid validators list has been provided!");
    }

    this.Validators = validators;
    this["ValidatorOptions"].minLength =
      this["ValidatorOptions"].maxLength =
        validators.length;

    this._custom(async (ctx) => {
      if (!(ctx.output instanceof Array)) {
        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid array has been provided!",
        );
      }

      const MinLength = ctx.validatorOptions?.minLength ??
        this.Validators.length;
      const MaxLength = ctx.validatorOptions?.maxLength ?? MinLength;

      if (ctx.output.length < MinLength) {
        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.smallerLength,
          "Array is smaller than minimum length!",
        );
      }

      if (!this.RestValidator || MaxLength > MinLength) {
        if (ctx.output.length > MaxLength) {
          throw await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.greaterLength,
            "Array is larger than maximum length!",
          );
        }
      }

      ctx.output = [...ctx.output];

      const Exception = new ValidationException();

      for (const [Key, Value] of Object.entries(ctx.output)) {
        const Index = parseInt(Key);
        const Validator = BaseValidator.resolveValidator(
          this.Validators[Index] ?? this.RestValidator,
        );

        const Location = `${ctx.location}.${Key}`;

        try {
          ctx.output[Index] = await Validator.validate(Value, {
            ...this.overrideContext(ctx),
            location: Location,
            index: Index,
            property: Key,
            parent: ctx,
          });
        } catch (error) {
          Exception.pushIssues(error);
        }
      }

      if (Exception.issues.length) throw Exception;
    });
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
