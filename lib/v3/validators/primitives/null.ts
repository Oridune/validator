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

export interface INullValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "castOptions"> {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class NullValidator<
  Shape extends null = null,
  Input extends null = null,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static null = NullValidator.createFactory(NullValidator);

  protected override _toJSON(ctx?: IJSONSchemaContext<INullValidatorOptions>) {
    return {
      type: "null",
      description: BaseValidator.prepareDescription(
        ctx?.validatorOptions ?? {},
      ),
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(
    _ctx?: ISampleDataContext<INullValidatorOptions>,
  ) {
    return this.Sample ?? (null as Input);
  }

  protected override _toStatic(
    ctx?: IStaticContext<INullValidatorOptions>,
  ): NullValidator<Shape, Input, Output> {
    return NullValidator.null(ctx?.validatorOptions);
  }

  constructor(options?: INullValidatorOptions) {
    super(ValidatorType.PRIMITIVE, "null", options);

    this._custom(async (ctx) => {
      if (ctx.output !== null) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Value should be null!",
        );
      }
    }, true);
  }
}
