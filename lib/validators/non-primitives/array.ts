// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import {
  TErrorMessage,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface IArrayValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  splitter?: string | RegExp;
  messages?: Partial<
    Record<"typeError" | "smallerLength" | "greaterLength", TErrorMessage>
  >;
}

export class ArrayValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IArrayValidatorOptions;
  protected Validator?: BaseValidator<any, any, any>;

  protected MinLength?: number;
  protected MaxLength?: number;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "array",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      items: this.Validator?.["_toJSON"](),
    };
  }

  protected _toSample(options?: ISampleDataOptions) {
    const Output = [] as Input & Array<any>;

    if (this.Validator instanceof BaseValidator)
      for (let i = 0; i < (this.MinLength ?? 1); i++)
        Output.push(this.Validator["_toSample"](options));

    return this.Sample ?? Output;
  }

  constructor(validator?: Type, options: IArrayValidatorOptions = {}) {
    super(options);

    if (validator)
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");
      else this.Validator = validator;

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

      ctx.output = [...ctx.output];

      const Exception = new ValidationException();

      if (this.Validator)
        for (const [Index, Input] of Object.entries(ctx.output))
          try {
            ctx.output[parseInt(Index)] = await this.Validator.validate(Input, {
              ...ctx,
              location: `${ctx.location}.${Index}`,
              index: parseInt(Index),
              property: Index,
              parent: ctx,
            });
          } catch (error) {
            Exception.pushIssues(error);
          }

      if (Exception.issues.length) throw Exception;
    });
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options =
      typeof options === "object" ? options : { min: options, max: options };
    this.MinLength = Options.min;
    this.MaxLength = Options.max;

    const Validator = this.custom(async (ctx) => {
      if (ctx.output?.length < (Options.min || 0))
        throw await this._resolveErrorMessage(
          this.Options.messages?.smallerLength,
          "Array is smaller than minimum length!"
        );

      if (ctx.output?.length > (Options.max || Infinity))
        throw await this._resolveErrorMessage(
          this.Options.messages?.greaterLength,
          "Array is greater than maximum length!"
        );
    });

    return Validator as ArrayValidator<
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
