import {
  TErrorMessage,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface IBigIntValidatorOptions extends IBaseValidatorOptions {
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class BigIntValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IBigIntValidatorOptions;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "bigint",
      description: this.Description,
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return this.Sample ?? (1n as Input);
  }

  constructor(options: IBigIntValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (typeof ctx.output !== "bigint")
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Invalid bigint has been provided!"
        );
    });
  }
}
