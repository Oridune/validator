import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface IUndefinedValidatorOptions extends IBaseValidatorOptions {
  messages?: {
    typeError?: string;
  };
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

  constructor(options: IUndefinedValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom((ctx) => {
      ctx.output = ctx.input;

      if (ctx.output !== undefined)
        throw this.Options?.messages?.typeError ?? "Value should be undefined!";
    });
  }
}
