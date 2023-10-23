// deno-lint-ignore-file no-explicit-any
import { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface INumberValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  messages?: Partial<
    Record<
      | "typeError"
      | "smallerLength"
      | "greaterLength"
      | "smallerAmount"
      | "greaterAmount"
      | "notInt"
      | "notFloat",
      TErrorMessage
    >
  >;
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

  protected _toSample(_options?: ISampleDataOptions) {
    return (
      this.Sample ??
      (() => {
        const Min = this.MinAmount ?? 1;
        const Max = this.MaxAmount ?? 2;
        const Num = Math.floor(Math.random() * (Max - Min + 1) + Min);
        const Nums: number[] = new Array(this.MinLength ?? 1).fill(0);

        Nums[0] = Num;

        return parseInt(
          typeof this.MaxLength === "number"
            ? Nums.join("").slice(0, this.MaxLength)
            : Nums.join("")
        ) as Input;
      })()
    );
  }

  constructor(options: INumberValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (this.Options.cast && typeof ctx.output !== "number")
        ctx.output = parseFloat(ctx.output);

      if (typeof ctx.output !== "number" || isNaN(ctx.output))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Invalid number has been provided!"
        );
    });
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options =
      typeof options === "object" ? options : { min: options, max: options };
    this.MinLength = Options.min;
    this.MaxLength = Options.max;

    const Validator = this.custom(async (ctx) => {
      const Input = `${ctx.output}`;

      if (Input.length < (Options.min || 0))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.smallerLength,
          "Number is smaller than minimum length!"
        );

      if (Input.length > (Options.max || Infinity))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.greaterLength,
          "Number is greater than maximum length!"
        );
    });

    return Validator as NumberValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }

  public amount(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object" ? options : { max: options };
    this.MinAmount = Options.min;
    this.MaxAmount = Options.max;

    const Validator = this.custom(async (ctx) => {
      if (ctx.output < (Options.min || -Infinity))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.smallerAmount,
          "Number is smaller than minimum amount!"
        );

      if (ctx.output > (Options.max || Infinity))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.greaterAmount,
          "Number is greater than maximum amount!"
        );
    });

    return Validator as NumberValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }

  public min(amount: number) {
    return this.amount({ min: amount });
  }

  public max(amount: number) {
    return this.amount({ max: amount });
  }

  public int() {
    this.IsInt = true;

    const Validator = this.custom(async (ctx) => {
      if (isNaN(ctx.output) || ctx.output % 1 !== 0)
        throw await this._resolveErrorMessage(
          this.Options?.messages?.notInt,
          "Number should be an integer!"
        );
    });

    return Validator as NumberValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }

  public float() {
    this.IsFloat = true;

    const Validator = this.custom(async (ctx) => {
      if (isNaN(ctx.output) || ctx.output % 1 === 0)
        throw await this._resolveErrorMessage(
          this.Options?.messages?.notFloat,
          "Number should be a float!"
        );
    });

    return Validator as NumberValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }
}
