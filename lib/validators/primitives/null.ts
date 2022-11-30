import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface INullValidatorOptions extends IBaseValidatorOptions {
  messages?: {
    typeError?: string;
  };
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

  constructor(options: INullValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom((ctx) => {
      ctx.output = ctx.input;

      if (ctx.output !== null)
        throw this.Options?.messages?.typeError ?? "Value should be null!";
    });
  }
}
