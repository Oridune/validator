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

  /**
   * If passed `true` than the validator will try to instantiate the class with the input value.
   */
  instantiate?: boolean;

  /**
   * If `instantiate` is set to `true`, the validator try to instantiate the class with the input value in the first argument, You can pass the rest of the arguments here if any.
   */
  instantiationRestArgs?: any[] | ((value: any) => any[] | Promise<any[]>);
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
        try {
          if (!this.Options.instantiate) throw "";

          return new this.Constructor(
            ctx.output,
            ...(typeof this.Options.instantiationRestArgs === "function"
              ? await this.Options.instantiationRestArgs(ctx.output)
              : this.Options.instantiationRestArgs ?? [])
          );
        } catch {
          throw await this._resolveErrorMessage(
            this.Options?.messages?.typeError,
            `Value is not an instanceOf ${this.Constructor}!`
          );
        }
    });
  }
}
