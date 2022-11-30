import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface IBigIntValidatorOptions extends IBaseValidatorOptions {
  messages?: {
    typeError?: string;
  };
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

  constructor(options: IBigIntValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom((ctx) => {
      ctx.output = ctx.input;

      if (typeof ctx.output !== "bigint")
        throw (
          this.Options?.messages?.typeError ??
          "Invalid bigint has been provided!"
        );
    });
  }
}
