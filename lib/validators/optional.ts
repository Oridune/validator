// deno-lint-ignore-file no-explicit-any
import { BaseValidator, IValidationContext } from "./base.ts";

export type OptionalValidatorOptions = {
  nullish?: boolean;
};

export class OptionalValidator<Validator, Input, Output> extends BaseValidator<
  Validator,
  Input,
  Output
> {
  protected DefaultValue?: any;

  protected async _validate(
    input: any,
    ctx: IValidationContext
  ): Promise<Output> {
    if (
      input !== undefined &&
      (this.Options.nullish !== true || (this.Options.nullish && !!input))
    )
      if (this.Validator instanceof BaseValidator)
        return await this.Validator.validate(input, ctx);

    return this.DefaultValue;
  }

  constructor(
    protected Validator: Validator,
    protected Options: OptionalValidatorOptions
  ) {
    super();

    if (!(this.Validator instanceof BaseValidator))
      throw new Error("Invalid validator instance has been provided!");
  }

  public default<DefaultInput>(
    value: DefaultInput
  ): OptionalValidator<
    Validator,
    Input,
    Exclude<DefaultInput | Output, undefined>
  > {
    this.DefaultValue = value;
    return this as any;
  }
}
