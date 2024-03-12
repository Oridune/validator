import { TErrorMessage } from "../../types.ts";
import {
  ValidatorType,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface INullValidatorOptions extends IBaseValidatorOptions {
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class NullValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: INullValidatorOptions;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "null",
      description: this.Description,
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return this.Sample ?? (null as Input);
  }

  constructor(options: INullValidatorOptions = {}) {
    super(ValidatorType.PRIMITIVE, options);

    this.Options = options;

    this._custom(async (ctx) => {
      ctx.output = ctx.input;

      if (ctx.output !== null)
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Value should be null!"
        );
    });
  }
}
