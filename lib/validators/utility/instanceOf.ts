// deno-lint-ignore-file no-explicit-any
import { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface IInstanceOfValidatorOptions extends IBaseValidatorOptions {
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class InstanceOfValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: typeof (this.Sample ?? {}),
      description: this.Description,
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return this.Sample ?? ({} as Input);
  }

  constructor(
    protected Constructor: any,
    protected Options: IInstanceOfValidatorOptions = {}
  ) {
    super(Options);

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (!(ctx.output instanceof this.Constructor))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          `Value is not an instanceOf ${this.Constructor}!`
        );
    });
  }
}
