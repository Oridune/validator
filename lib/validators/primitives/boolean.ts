import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface IBooleanValidatorOptions extends IBaseValidatorOptions {
  expected?: boolean;
  cast?: boolean;
  messages?: {
    typeError?: string;
    notTrue?: string;
    notFalse?: string;
  };
}

export class BooleanValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IBooleanValidatorOptions;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "boolean",
      description: this.Description,
      expected: this.Options?.expected,
    };
  }

  constructor(options: IBooleanValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom((ctx) => {
      ctx.output = ctx.input;

      if (this.Options.cast && typeof ctx.output !== "boolean")
        ctx.output = ["true", "1"].includes(`${ctx.output}`.toLowerCase());

      if (typeof ctx.output !== "boolean")
        throw (
          this.Options?.messages?.typeError ??
          "Invalid boolean has been provided!"
        );

      if (
        typeof this.Options.expected === "boolean" &&
        this.Options.expected !== ctx.output
      )
        throw this.Options.expected
          ? this.Options.messages?.notTrue ?? "Value should be true!"
          : this.Options.messages?.notFalse ?? "Value should be false!";
    });
  }
}
