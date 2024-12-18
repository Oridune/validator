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

export interface IUndefinedValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class UndefinedValidator<
  Shape extends undefined = undefined,
  Input extends undefined = undefined,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static undefined = UndefinedValidator.createFactory(UndefinedValidator);

  protected override _toJSON(
    ctx?: IJSONSchemaContext<IUndefinedValidatorOptions>,
  ) {
    return {
      type: "undefined",
      description: BaseValidator.prepareDescription(
        ctx?.validatorOptions ?? {},
      ),
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(
    _ctx?: ISampleDataContext<IUndefinedValidatorOptions>,
  ) {
    return this.Sample ?? (undefined as Input);
  }

  protected override _toStatic(
    ctx?: IStaticContext<IUndefinedValidatorOptions>,
  ): UndefinedValidator<Shape, Input, Output> {
    return UndefinedValidator.undefined(ctx?.validatorOptions);
  }

  protected override _cast(ctx: IValidatorContext<any, any>) {
    if (typeof ctx.output !== "undefined" && [null, ""].includes(ctx.output)) {
      ctx.output = undefined;
    }
  }

  constructor(options?: IUndefinedValidatorOptions) {
    super(ValidatorType.PRIMITIVE, "undefined", options);

    this._custom(async (ctx) => {
      if (ctx.output !== undefined) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Value should be undefined!",
        );
      }
    }, true);
  }
}
