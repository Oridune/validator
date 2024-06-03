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

export interface IUndefinedValidatorOptions extends TBaseValidatorOptions {
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class UndefinedValidator<
  Shape extends undefined = undefined,
  Input extends undefined = undefined,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static undefined = UndefinedValidator.createFactory(UndefinedValidator);

  protected _toJSON(ctx?: IJSONSchemaContext<IUndefinedValidatorOptions>) {
    return {
      type: "undefined",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(_ctx?: ISampleDataContext<IUndefinedValidatorOptions>) {
    return this.Sample ?? (undefined as Input);
  }

  protected _toStatic(
    ctx?: IStaticContext<IUndefinedValidatorOptions>,
  ): UndefinedValidator<Shape, Input, Output> {
    return UndefinedValidator.undefined(ctx?.validatorOptions);
  }

  constructor(options?: IUndefinedValidatorOptions) {
    super(ValidatorType.PRIMITIVE, "undefined", options);

    this._custom(async (ctx) => {
      if (ctx.output !== undefined) {
        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Value should be undefined!",
        );
      }
    });
  }
}
