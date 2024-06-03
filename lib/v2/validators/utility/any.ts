import {
  BaseValidator,
  type IBaseValidatorOptions,
  type IJSONSchemaOptions,
  type ISampleDataOptions,
  ValidatorType,
} from "../base.ts";

export interface IAnyValidatorOptions extends IBaseValidatorOptions {}

export class AnyValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IAnyValidatorOptions;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "any",
      description: this.Description,
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return this.Sample ?? (undefined as Input);
  }

  constructor(options: IAnyValidatorOptions = {}) {
    super(ValidatorType.UTILITY, options);

    this.Options = options;
  }
}
