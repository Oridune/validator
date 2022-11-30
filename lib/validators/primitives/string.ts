// deno-lint-ignore-file no-explicit-any
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface IStringValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  messages?: {
    typeError?: string;
    smallerLength?: string;
    greaterLength?: string;
    matchFailed?: string;
    invalidChoice?: string;
    numberLike?: string;
  };
}

export class StringValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IStringValidatorOptions;

  protected MinLength?: number;
  protected MaxLength?: number;
  protected Pattern?: RegExp;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "string",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      pattern: this.Pattern?.toString(),
    };
  }

  constructor(options: IStringValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom((ctx) => {
      ctx.output = ctx.input;

      if (this.Options.cast && typeof ctx.output !== "string")
        ctx.output = `${ctx.output}`;

      if (typeof ctx.output !== "string")
        throw (
          this.Options?.messages?.typeError ??
          "Invalid string has been provided!"
        );
    });
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object" ? options : { max: options };
    this.MinLength = Options.min;
    this.MaxLength = Options.max;

    return this.custom((ctx) => {
      if (ctx.output?.length < (Options.min || 0))
        throw (
          this.Options?.messages?.smallerLength ??
          "String is smaller than minimum length!"
        );

      if (ctx.output?.length > (Options.max || Infinity))
        throw (
          this.Options?.messages?.greaterLength ??
          "String is greater than maximum length!"
        );
    });
  }

  public matches(options: { regex: RegExp } | RegExp) {
    const Options = options instanceof RegExp ? { regex: options } : options;
    this.Pattern = Options.regex;

    return this.custom((ctx) => {
      if (!Options.regex?.test(ctx.output))
        throw (
          this.Options?.messages?.matchFailed ??
          "String didn't match the required pattern!"
        );
    });
  }

  public in<C extends string>(choices: C[]): StringValidator<Type, Input, C> {
    return this.custom((ctx) => {
      if (!choices.includes(ctx.output))
        throw this.Options?.messages?.matchFailed ?? "Invalid choice!";
    }) as any;
  }

  public isNaN() {
    return this.custom((ctx) => {
      if (!isNaN(ctx.output))
        throw (
          this.Options?.messages?.numberLike ??
          "String should not be number like!"
        );
    });
  }
}
