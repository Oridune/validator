// deno-lint-ignore-file no-explicit-any
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
} from "./base.ts";

export type OptionalValidatorOptions = {
  nullish?: boolean;
};

export type DefaultValueType<DefaultInput> = DefaultInput extends () => Promise<
  infer T
>
  ? T
  : DefaultInput extends () => infer T
  ? T
  : DefaultInput;

export class OptionalValidator<Validator, Input, Output> extends BaseValidator<
  Validator,
  Input,
  Output
> {
  protected Validator: BaseValidator<any, any, any>;
  protected DefaultValue?: any;

  protected _toJSON(_options?: JSONSchemaOptions) {
    return this.Validator["_toJSON"]();
  }

  protected async _validate(
    input: any,
    ctx: IValidationContext
  ): Promise<Output> {
    if (
      input !== undefined &&
      (this.Options.nullish !== true || (this.Options.nullish && !!input))
    )
      return await this.Validator.validate(input, ctx);

    return typeof this.DefaultValue === "function"
      ? this.DefaultValue()
      : this.DefaultValue;
  }

  constructor(
    validator: Validator,
    protected Options: OptionalValidatorOptions
  ) {
    super();

    if (!(validator instanceof BaseValidator))
      throw new Error("Invalid validator instance has been provided!");

    this.Validator = validator;
  }

  public default<DefaultInput>(
    value: DefaultInput
  ): OptionalValidator<
    Validator,
    Input,
    | (DefaultValueType<DefaultInput> extends Promise<infer T>
        ? T
        : DefaultValueType<DefaultInput>)
    | Exclude<Output, undefined>
  > {
    this.DefaultValue = value;
    return this as any;
  }
}
