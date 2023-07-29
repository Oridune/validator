// deno-lint-ignore-file no-explicit-any
import {
  TErrorMessage,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface IStringValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  messages?: Partial<
    Record<
      | "typeError"
      | "smallerLength"
      | "greaterLength"
      | "matchFailed"
      | "invalidChoice"
      | "numberLike",
      TErrorMessage
    >
  >;
}

export class StringValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IStringValidatorOptions;

  protected MinLength?: number;
  protected MaxLength?: number;
  protected Patterns?: RegExp[];

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "string",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      patterns: this.Patterns?.map((pattern) => pattern.toString()),
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return this.Sample ?? ("" as Input);
  }

  constructor(options: IStringValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (this.Options.cast && typeof ctx.output !== "string")
        ctx.output = `${ctx.output}`;

      if (typeof ctx.output !== "string")
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Invalid string has been provided!"
        );
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
          this.Options?.messages?.smallerLength,
          "String is smaller than minimum length!"
        );

      if (ctx.output?.length > (Options.max || Infinity))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.greaterLength,
          "String is greater than maximum length!"
        );
    });

    return Validator as StringValidator<
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

  public matches(options: { regex: RegExp | RegExp[] } | RegExp | RegExp[]) {
    const Options =
      options instanceof RegExp || options instanceof Array
        ? { regex: options }
        : options;
    const Patterns =
      Options.regex instanceof Array ? Options.regex : [Options.regex];

    for (const Pattern of Patterns)
      if (!(Pattern instanceof RegExp))
        throw new Error(
          `Invalid regular expression '${Pattern}' has been provided!`
        );

    this.Patterns = Patterns;

    const Validator = this.custom(async (ctx) => {
      for (const Pattern of Patterns)
        if (!Pattern.test(ctx.output))
          throw await this._resolveErrorMessage(
            this.Options?.messages?.matchFailed,
            "String didn't match the expected pattern!"
          );
    });

    return Validator as StringValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }

  public in<C extends string>(choices: C[]): StringValidator<Type, Input, C> {
    return this.custom(async (ctx) => {
      if (!choices.includes(ctx.output))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.invalidChoice,
          "Invalid choice!"
        );
    }) as any;
  }

  public isNaN() {
    const Validator = this.custom(async (ctx) => {
      if (!isNaN(ctx.output))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.numberLike,
          "String should not be number like!"
        );
    });

    return Validator as StringValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }
}
