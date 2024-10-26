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

export interface IBigIntValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class BigIntValidator<
  Shape extends BigIntConstructor = BigIntConstructor,
  Input extends bigint = bigint,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static bigint = BigIntValidator.createFactory(BigIntValidator);

  protected override _toJSON(
    ctx?: IJSONSchemaContext<IBigIntValidatorOptions>,
  ) {
    return {
      type: "bigint",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(
    _ctx?: ISampleDataContext<IBigIntValidatorOptions>,
  ) {
    return this.Sample ?? (1n as Input);
  }

  protected override _toStatic(
    ctx?: IStaticContext<IBigIntValidatorOptions>,
  ): BigIntValidator<Shape, Input, Output> {
    return BigIntValidator.bigint(ctx?.validatorOptions);
  }

  protected override _cast(ctx: IValidatorContext<any, any>) {
    if (typeof ctx.output !== "bigint") {
      try {
        ctx.output = BigInt(parseInt(ctx.output));
      } catch {
        // Do nothing...
      }
    }
  }

  constructor(options?: IBigIntValidatorOptions) {
    super(ValidatorType.PRIMITIVE, "bigint", options);

    this._custom(async (ctx) => {
      if (typeof ctx.output !== "bigint") {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid bigint has been provided!",
        );
      }
    }, true);
  }
}
