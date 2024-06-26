import type { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  type IBaseValidatorOptions,
  type IJSONSchemaOptions,
  type ISampleDataOptions,
  ValidatorType,
} from "../base.ts";

export interface IUndefinedValidatorOptions extends IBaseValidatorOptions {
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class UndefinedValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IUndefinedValidatorOptions;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "undefined",
      description: this.Description,
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return this.Sample ?? (undefined as Input);
  }

  constructor(options: IUndefinedValidatorOptions = {}) {
    super(ValidatorType.PRIMITIVE, options);

    this.Options = options;

    this._custom(async (ctx) => {
      if (ctx.output !== undefined) {
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Value should be undefined!",
        );
      }
    });
  }
}
