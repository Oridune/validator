import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface INumberValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  messages?: {
    typeError?: string;
    smallerLength?: string;
    greaterLength?: string;
    smallerAmount?: string;
    greaterAmount?: string;
    notInt?: string;
    notFloat?: string;
  };
}

export class NumberValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: INumberValidatorOptions;

  protected IsInt?: boolean;
  protected IsFloat?: boolean;
  protected MinLength?: number;
  protected MaxLength?: number;
  protected MinAmount?: number;
  protected MaxAmount?: number;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "number",
      description: this.Description,
      isInt: this.IsInt,
      isFloat: this.IsFloat,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      minAmount: this.MinAmount,
      maxAmount: this.MaxAmount,
    };
  }

  constructor(options: INumberValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom((ctx) => {
      ctx.output = ctx.input;

      if (this.Options.cast && typeof ctx.output !== "number")
        ctx.output = parseFloat(ctx.output);

      if (typeof ctx.output !== "number" || isNaN(ctx.output))
        throw (
          this.Options?.messages?.typeError ??
          "Invalid number has been provided!"
        );
    });
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object" ? options : { max: options };
    this.MinLength = Options.min;
    this.MaxLength = Options.max;

    return this.custom((ctx) => {
      const Input = `${ctx.output}`;

      if (Input.length < (Options.min || 0))
        throw (
          this.Options?.messages?.smallerLength ??
          "Number is smaller than minimum length!"
        );

      if (Input.length > (Options.max || Infinity))
        throw (
          this.Options?.messages?.greaterLength ??
          "Number is greater than maximum length!"
        );
    });
  }

  public amount(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object" ? options : { max: options };
    this.MinAmount = Options.min;
    this.MaxAmount = Options.max;

    return this.custom((ctx) => {
      if (ctx.output < (Options.min || 0))
        throw (
          this.Options?.messages?.smallerAmount ??
          "Number is smaller than minimum amount!"
        );

      if (ctx.output > (Options.max || Infinity))
        throw (
          this.Options?.messages?.greaterAmount ??
          "Number is greater than maximum amount!"
        );
    });
  }

  public int() {
    this.IsInt = true;

    return this.custom((ctx) => {
      if (isNaN(ctx.output) || ctx.output % 1 !== 0)
        throw this.Options?.messages?.notInt ?? "Number should be an integer!";
    });
  }

  public float() {
    this.IsFloat = true;

    return this.custom((ctx) => {
      if (isNaN(ctx.output) || ctx.output % 1 === 0)
        throw this.Options?.messages?.notFloat ?? "Number should be a float!";
    });
  }
}
