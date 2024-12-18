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
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<"typeError" | "notTrue" | "notFalse", TErrorMessage>
  >;

  /** Validate expected value to be true or false */
  expected?: boolean;
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

  protected override _toJSON(
    ctx?: IJSONSchemaContext<IBooleanValidatorOptions>,
  ) {
    return {
      type: "boolean",
      description: BaseValidator.prepareDescription(
        ctx?.validatorOptions ?? {},
      ),
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      expected: ctx?.validatorOptions?.expected,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(
    ctx?: ISampleDataContext<IBooleanValidatorOptions>,
  ) {
    return (
      this.Sample ?? ctx?.validatorOptions?.expected ??
        ([true, false][Math.floor(Math.random() * (1 - 0 + 1) + 0)] as Input)
    );
  }

  protected override _toStatic(
    ctx?: IStaticContext<IBooleanValidatorOptions>,
  ): BooleanValidator<Shape, Input, Output> {
    return BooleanValidator.boolean(ctx?.validatorOptions);
  }

  protected override _cast(ctx: IValidatorContext<any, any>) {
    if (typeof ctx.output !== "boolean") {
      ctx.output = ["true", "1"].includes(`${ctx.output}`.toLowerCase());
    }
  }

  constructor(options?: IBooleanValidatorOptions) {
    super(ValidatorType.PRIMITIVE, "boolean", options);

    this._custom(async (ctx) => {
      if (typeof ctx.output !== "boolean") {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid boolean has been provided!",
        );
      }

      if (
        typeof ctx.validatorOptions?.expected === "boolean" &&
        ctx.validatorOptions?.expected !== ctx.output
      ) {
        throw ctx.validatorOptions?.expected
          ? await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.notTrue,
            "Value should be true!",
          )
          : await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.notFalse,
            "Value should be false!",
          );
      }
    }, true);
  }
}
