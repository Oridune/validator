import { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
  IValidatorContext,
} from "../base.ts";

export interface IIfValidatorOptions extends IBaseValidatorOptions {
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class IfValidator<Type, Input, Output> extends BaseValidator<
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
    protected Predicate:
      | boolean
      | ((value: Input, ctx: IValidatorContext) => boolean),
    protected Options: IIfValidatorOptions = {}
  ) {
    super(Options);

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (
        !(typeof this.Predicate === "function"
          ? this.Predicate(ctx.input, ctx)
          : this.Predicate)
      )
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Value does not match the expectation!"
        );
    });
  }
}
