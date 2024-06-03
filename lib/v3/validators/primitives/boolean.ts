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

export interface IBooleanValidatorOptions extends TBaseValidatorOptions {
  expected?: boolean;
  messages?: Partial<
    Record<"typeError" | "notTrue" | "notFalse", TErrorMessage>
  >;
}

export class BooleanValidator<
  Shape extends BooleanConstructor = BooleanConstructor,
  Input extends boolean = boolean,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static boolean = BooleanValidator.createFactory(BooleanValidator);

  static true = (options?: Omit<IBooleanValidatorOptions, "expected">) =>
    BooleanValidator.boolean({
      ...options,
      expected: true,
    }) as BooleanValidator<BooleanConstructor, true, true>;

  static false = (options?: Omit<IBooleanValidatorOptions, "expected">) =>
    BooleanValidator.boolean({
      ...options,
      expected: false,
    }) as BooleanValidator<BooleanConstructor, false, false>;

  protected _toJSON(ctx?: IJSONSchemaContext<IBooleanValidatorOptions>) {
    return {
      type: "boolean",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      expected: ctx?.validatorOptions?.expected,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(ctx?: ISampleDataContext<IBooleanValidatorOptions>) {
    return (
      this.Sample ?? ctx?.validatorOptions?.expected ??
        ([true, false][Math.floor(Math.random() * (1 - 0 + 1) + 0)] as Input)
    );
  }

  protected _toStatic(
    ctx?: IStaticContext<IBooleanValidatorOptions>,
  ): BooleanValidator<Shape, Input, Output> {
    return BooleanValidator.boolean(ctx?.validatorOptions);
  }

  protected _cast(ctx: IValidatorContext<any, any>) {
    if (typeof ctx.output !== "boolean") {
      ctx.output = ["true", "1"].includes(`${ctx.output}`.toLowerCase());
    }
  }

  constructor(options?: IBooleanValidatorOptions) {
    super(ValidatorType.PRIMITIVE, options);

    this._custom(async (ctx) => {
      if (typeof ctx.output !== "boolean") {
        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid boolean has been provided!",
        );
      }

      if (
        typeof ctx.validatorOptions?.expected === "boolean" &&
        ctx.validatorOptions?.expected !== ctx.output
      ) {
        throw ctx.validatorOptions?.expected
          ? await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.notTrue,
            "Value should be true!",
          )
          : await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.notFalse,
            "Value should be false!",
          );
      }
    });
  }
}
