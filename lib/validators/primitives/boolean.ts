import { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface IBooleanValidatorOptions extends IBaseValidatorOptions {
  expected?: boolean;
  cast?: boolean;
  messages?: Partial<
    Record<"typeError" | "notTrue" | "notFalse", TErrorMessage>
  >;
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

  protected _toSample(_options?: ISampleDataOptions) {
    return (
      this.Sample ??
      ([true, false][Math.floor(Math.random() * (1 - 0 + 1) + 0)] as Input)
    );
  }

  constructor(options: IBooleanValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (this.Options.cast && typeof ctx.output !== "boolean")
        ctx.output = ["true", "1"].includes(`${ctx.output}`.toLowerCase());

      if (typeof ctx.output !== "boolean")
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Invalid boolean has been provided!"
        );

      if (
        typeof this.Options.expected === "boolean" &&
        this.Options.expected !== ctx.output
      )
        throw this.Options.expected
          ? await this._resolveErrorMessage(
              this.Options.messages?.notTrue,
              "Value should be true!"
            )
          : await this._resolveErrorMessage(
              this.Options.messages?.notFalse,
              "Value should be false!"
            );
    });
  }
}
