// deno-lint-ignore-file no-explicit-any
import type { TErrorMessage } from "../../types.ts";
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

export interface INumberValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
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

  /** Validate number is int */
  isInt?: boolean;

  /** Validate number is float */
  isFloat?: boolean;

  /** Validate number minimum length */
  minLength?: number;

  /** Validate number maximum length */
  maxLength?: number;

  /** Validate number minimum length */
  minAmount?: number;

  /** Validate number maximum length */
  maxAmount?: number;
}

export class NumberValidator<
  Shape extends NumberConstructor = NumberConstructor,
  Input extends number = number,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static number = NumberValidator.createFactory(NumberValidator);

  protected override _toJSON(
    ctx?: IJSONSchemaContext<INumberValidatorOptions>,
  ) {
    return {
      type: "number",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      isInt: ctx?.validatorOptions?.isInt,
      isFloat: ctx?.validatorOptions?.isFloat,
      minLength: ctx?.validatorOptions?.minLength,
      maxLength: ctx?.validatorOptions?.maxLength,
      minAmount: ctx?.validatorOptions?.minAmount,
      maxAmount: ctx?.validatorOptions?.maxAmount,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(
    ctx?: ISampleDataContext<INumberValidatorOptions>,
  ) {
    return (
      this.Sample ??
        (() => {
          const Min = ctx?.validatorOptions?.minAmount ?? 1;
          const Max = ctx?.validatorOptions?.maxAmount ?? 2;
          const Num = Math.floor(Math.random() * (Max - Min + 1) + Min);
          const Nums: number[] = new Array(
            ctx?.validatorOptions?.minLength ?? 1,
          ).fill(0);

          Nums[0] = Num;

          return parseInt(
            typeof ctx?.validatorOptions?.maxLength === "number"
              ? Nums.join("").slice(0, ctx.validatorOptions.maxLength)
              : Nums.join(""),
          ) as Input;
        })()
    );
  }

  protected override _toStatic(
    ctx?: IStaticContext<INumberValidatorOptions>,
  ): NumberValidator<Shape, Input, Output> {
    return NumberValidator.number(ctx?.validatorOptions);
  }

  protected override _cast(ctx: IValidatorContext<any, any>) {
    if (typeof ctx.output !== "number") {
      ctx.output = parseFloat(ctx.output);
    }
  }

  constructor(options?: INumberValidatorOptions) {
    super(ValidatorType.PRIMITIVE, "number", options);

    this._custom(async (ctx) => {
      if (typeof ctx.output !== "number" || isNaN(ctx.output)) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid number has been provided!",
        );
      }

      const InputStr = `${ctx.output}`;

      if (typeof ctx.validatorOptions?.minLength === "number") {
        if (InputStr.length < ctx.validatorOptions.minLength) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.smallerLength,
            "Number is smaller than minimum length!",
          );
        }
      }

      if (typeof ctx.validatorOptions?.maxLength === "number") {
        if (InputStr.length > ctx.validatorOptions.maxLength) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.greaterLength,
            "Number is greater than maximum length!",
          );
        }
      }

      if (typeof ctx.validatorOptions?.minAmount === "number") {
        if (ctx.output < ctx.validatorOptions.minAmount) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.smallerAmount,
            "Number is smaller than minimum amount!",
          );
        }
      }

      if (typeof ctx.validatorOptions?.maxAmount === "number") {
        if (ctx.output > ctx.validatorOptions.maxAmount) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.greaterAmount,
            "Number is greater than maximum amount!",
          );
        }
      }

      if (ctx.validatorOptions?.isInt) {
        if (isNaN(ctx.output) || ctx.output % 1 !== 0) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.notInt,
            "Number should be an integer!",
          );
        }
      }

      if (ctx.validatorOptions?.isFloat) {
        if (isNaN(ctx.output) || ctx.output % 1 === 0) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.notFloat,
            "Number should be a float!",
          );
        }
      }
    }, true);
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object"
      ? options
      : { min: options, max: options };

    this["ValidatorOptions"].minLength = Options.min ??
      this["ValidatorOptions"].minLength;
    this["ValidatorOptions"].maxLength = Options.max ??
      this["ValidatorOptions"].maxLength;

    return this;
  }

  public amount(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object" ? options : { max: options };

    this["ValidatorOptions"].minAmount = Options.min ??
      this["ValidatorOptions"].minAmount;
    this["ValidatorOptions"].maxAmount = Options.max ??
      this["ValidatorOptions"].maxAmount;

    return this;
  }

  public min(amount: number) {
    return this.amount({ min: amount });
  }

  public max(amount: number) {
    return this.amount({ max: amount });
  }

  public int() {
    this["ValidatorOptions"].isInt = true;

    return this;
  }

  public float() {
    this["ValidatorOptions"].isFloat = true;

    return this;
  }
}
