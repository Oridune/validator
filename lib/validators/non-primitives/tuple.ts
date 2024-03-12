// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import { inferInput, inferOutput, TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
  ValidatorType,
} from "../base.ts";

export interface ITupleValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  splitter?: string | RegExp;
  messages?: Partial<
    Record<"typeError" | "smallerLength" | "greaterLength", TErrorMessage>
  >;
}

export class TupleValidator<
  Type extends Array<
    BaseValidator<any, any, any> | (() => BaseValidator<any, any, any>)
  >,
  Input,
  Output,
> extends BaseValidator<Type, Input, Output> {
  protected Options: ITupleValidatorOptions;
  protected Validators: Type;
  protected Validator?:
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>);

  protected MinLength = 0;
  protected MaxLength = 0;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    const RestValidator = this.Validator &&
      BaseValidator.resolveValidator(this.Validator);

    return {
      type: "array",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      tuple: this.Validators.map((validator) => {
        const Validator = BaseValidator.resolveValidator(validator);
        return Validator["_toJSON"]();
      }).filter(Boolean),
      items: RestValidator?.["_toJSON"](),
    };
  }

  protected _toSample(options?: ISampleDataOptions) {
    const Output = [] as Input & Array<any>;

    for (let i = 0; i < (this.MinLength ?? 1); i++) {
      const Validator = BaseValidator.resolveValidator(this.Validators[i]);
      const RestValidator = this.Validator &&
        BaseValidator.resolveValidator(this.Validator);

      Output.push((Validator ?? RestValidator)?.["_toSample"](options));
    }

    return this.Sample ?? Output.filter(Boolean);
  }

  constructor(validators: Type, options: ITupleValidatorOptions = {}) {
    super(ValidatorType.NON_PRIMITIVE, options);

    if (!(validators instanceof Array)) {
      throw new Error("Invalid validators list has been provided!");
    }

    this.Validators = validators;
    this.MinLength = this.MaxLength = validators.length;
    this.Options = options;

    this._custom(async (ctx) => {
      if (this.Options?.cast && typeof ctx.output === "string") {
        try {
          ctx.output = JSON.parse(ctx.output);
        } catch {
          if (this.Options.splitter) {
            ctx.output = ctx.output.toString().split(this.Options.splitter);
          }
        }
      }

      if (!(ctx.output instanceof Array)) {
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Invalid array has been provided!",
        );
      }

      if (ctx.output.length < this.Validators.length) {
        throw await this._resolveErrorMessage(
          this.Options?.messages?.smallerLength,
          "Array is smaller than minimum length!",
        );
      }

      if (!this.Validator) {
        if (ctx.output.length > this.Validators.length) {
          throw await this._resolveErrorMessage(
            this.Options?.messages?.greaterLength,
            "Array is larger than maximum length!",
          );
        }
      }

      ctx.output = [...ctx.output];

      const Exception = new ValidationException();

      for (const [Key, Value] of Object.entries(ctx.output)) {
        const Index = parseInt(Key);
        const Validator = BaseValidator.resolveValidator(
          this.Validators[Index] ?? this.Validator,
        );

        try {
          ctx.output[Index] = await Validator.validate(Value, {
            ...ctx,
            location: `${ctx.location}.${Index}`,
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
    T extends Array<any> = [...Type, ...Validator[]],
  >(
    validator: Validator | (() => Validator),
  ): TupleValidator<T, inferInput<T>, inferOutput<T>> {
    if (this.Validator) {
      throw new Error("A rest validator cannot follow another rest validator.");
    }

    this.Validator = validator;

    return this as any;
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object"
      ? options
      : { min: options, max: options };

    if ((Options.min ?? this.MinLength) < this.MinLength) {
      throw new Error(
        `Minimum length cannot be smaller than the defined tuple schema length!`,
      );
    }

    if ((Options.max ?? this.MaxLength) < this.MaxLength) {
      throw new Error(
        `Maximum length cannot be smaller than the defined tuple schema length!`,
      );
    }

    if ((Options.min ?? this.MinLength) > this.MinLength && !this.Validator) {
      throw new Error(
        `If you want to set a greater min length, please set a rest validator on the tuple!`,
      );
    }

    if ((Options.max ?? this.MaxLength) > this.MaxLength && !this.Validator) {
      throw new Error(
        `If you want to set a greater max length, please set a rest validator on the tuple!`,
      );
    }

    this.MinLength = Options.min ?? this.MinLength;
    this.MaxLength = Options.max ?? this.MaxLength;

    const Validator = this._custom(async (ctx) => {
      if (ctx.output?.length < (Options.min ?? 0)) {
        throw await this._resolveErrorMessage(
          this.Options?.messages?.smallerLength,
          "Array is smaller than minimum length!",
        );
      }

      if (ctx.output?.length > (Options.max ?? Infinity)) {
        throw await this._resolveErrorMessage(
          this.Options?.messages?.greaterLength,
          "Array is greater than maximum length!",
        );
      }
    });

    return Validator as TupleValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }

  public min(length: number) {
    return this.length({ min: length });
  }

  public max(length: number) {
    return this.length({ max: length });
  }
}
