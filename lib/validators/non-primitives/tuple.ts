// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import { TErrorMessage, inferInput, inferOutput } from "../../types.ts";
import {
  ValidatorType,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface ITupleValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  splitter?: string | RegExp;
  messages?: Partial<
    Record<"typeError" | "smallerLength" | "greaterLength", TErrorMessage>
  >;
}

export class TupleValidator<
  Type extends Array<any>,
  Input,
  Output
> extends BaseValidator<Type, Input, Output> {
  protected Options: ITupleValidatorOptions;
  protected Validators: BaseValidator<any, any, any>[] = [];
  protected Validator?: BaseValidator<any, any, any>;

  protected MinLength = 0;
  protected MaxLength = 0;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "array",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      tuple: this.Validators.map((validator) => validator["_toJSON"]()),
      items: this.Validator?.["_toJSON"](),
    };
  }

  protected _toSample(options?: ISampleDataOptions) {
    const Output = [] as Input & Array<any>;

    if (this.Validator instanceof BaseValidator)
      for (let i = 0; i < (this.MinLength ?? 1); i++)
        Output.push(
          (this.Validators[i] ?? this.Validator)["_toSample"](options)
        );

    return this.Sample ?? Output;
  }

  constructor(validators: Type[], options: ITupleValidatorOptions = {}) {
    super(ValidatorType.NON_PRIMITIVE, options);

    if (!(validators instanceof Array))
      throw new Error("Invalid validators list has been provided!");

    validators.forEach((validator) => {
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");

      this.MinLength += 1;
      this.MaxLength += 1;

      this.Validators.push(validator);
    });

    this.Options = options;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (this.Options?.cast && typeof ctx.output === "string")
        try {
          ctx.output = JSON.parse(ctx.output);
        } catch {
          if (this.Options.splitter)
            ctx.output = ctx.output.toString().split(this.Options.splitter);
        }

      if (!(ctx.output instanceof Array))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Invalid array has been provided!"
        );

      if (ctx.output.length < this.Validators.length)
        throw await this._resolveErrorMessage(
          this.Options?.messages?.smallerLength,
          "Array is smaller than minimum length!"
        );

      if (!(this.Validator instanceof BaseValidator))
        if (ctx.output.length > this.Validators.length)
          throw await this._resolveErrorMessage(
            this.Options?.messages?.greaterLength,
            "Array is larger than maximum length!"
          );

      ctx.output = [...ctx.output];

      const Exception = new ValidationException();

      for (const [Index, Input] of Object.entries(ctx.output)) {
        const Validator = this.Validators[parseInt(Index)] ?? this.Validator;

        if (Validator instanceof BaseValidator)
          try {
            ctx.output[parseInt(Index)] = await Validator.validate(Input, {
              ...ctx,
              location: `${ctx.location}.${Index}`,
              index: parseInt(Index),
              property: Index,
              parent: ctx,
            });
          } catch (error) {
            Exception.pushIssues(error);
          }
      }

      if (Exception.issues.length) throw Exception;
    });
  }

  public rest<Validator, T extends Array<any> = [...Type, ...Validator[]]>(
    validator: Validator
  ): TupleValidator<T, inferInput<T>, inferOutput<T>> {
    if (this.Validator instanceof BaseValidator)
      throw new Error("A rest validator cannot follow another rest validator.");

    if (!(validator instanceof BaseValidator))
      throw new Error("Invalid validator instance has been provided!");

    this.Validator = validator;
    return this as any;
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options =
      typeof options === "object" ? options : { min: options, max: options };

    if ((Options.min ?? this.MinLength) < this.MinLength)
      throw new Error(
        `Minimum length cannot be smaller than the defined tuple schema length!`
      );

    if ((Options.max ?? this.MaxLength) < this.MaxLength)
      throw new Error(
        `Maximum length cannot be smaller than the defined tuple schema length!`
      );

    if ((Options.min ?? this.MinLength) > this.MinLength && !this.Validator)
      throw new Error(
        `If you want to set a greater min length, please set a rest validator on the tuple!`
      );

    if ((Options.max ?? this.MaxLength) > this.MaxLength && !this.Validator)
      throw new Error(
        `If you want to set a greater max length, please set a rest validator on the tuple!`
      );

    this.MinLength = Options.min ?? this.MinLength;
    this.MaxLength = Options.max ?? this.MaxLength;

    const Validator = this.custom(async (ctx) => {
      if (ctx.output?.length < (Options.min || 0))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.smallerLength,
          "Array is smaller than minimum length!"
        );

      if (ctx.output?.length > (Options.max || Infinity))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.greaterLength,
          "Array is greater than maximum length!"
        );
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
