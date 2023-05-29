// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface IArrayValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  splitter?: string | RegExp;
  messages?: {
    typeError?: string;
    smallerLength?: string;
    greaterLength?: string;
  };
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
        throw (
          this.Options?.messages?.typeError ??
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
    const Options = typeof options === "object" ? options : { max: options };
    this.MinLength = Options.min;
    this.MaxLength = Options.max;

    const Validator = this.custom((ctx) => {
      if (ctx.output?.length < (Options.min || 0))
        throw (
          this.Options?.messages?.smallerLength ??
          "Array is smaller than minimum length!"
        );

      if (ctx.output?.length > (Options.max || Infinity))
        throw (
          this.Options?.messages?.greaterLength ??
          "Array is greater than maximum length!"
        );
    });

    return Validator as ArrayValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }
}
