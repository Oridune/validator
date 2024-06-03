import type { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export interface IBigIntValidatorOptions extends TBaseValidatorOptions {
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class BigIntValidator<
  Shape extends BigIntConstructor = BigIntConstructor,
  Input extends bigint = bigint,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static bigint = BigIntValidator.createFactory(BigIntValidator);

  protected _toJSON(ctx?: IJSONSchemaContext<IBigIntValidatorOptions>) {
    return {
      type: "bigint",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(_ctx?: ISampleDataContext<IBigIntValidatorOptions>) {
    return this.Sample ?? (1n as Input);
  }

  protected _toStatic(
    ctx?: IStaticContext<IBigIntValidatorOptions>,
  ): BigIntValidator<Shape, Input, Output> {
    return BigIntValidator.bigint(ctx?.validatorOptions);
  }

  constructor(options?: IBigIntValidatorOptions) {
    super(ValidatorType.PRIMITIVE, options);

    this._custom(async (ctx) => {
      if (typeof ctx.output !== "bigint") {
        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid bigint has been provided!",
        );
      }
    });
  }
}
