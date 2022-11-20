// deno-lint-ignore-file no-explicit-any
import { BaseValidator, IValidationContext } from "./base.ts";
import { ObjectValidator } from "./object.ts";

export type PickValidatorOptions<Keys> = {
  keys?: Keys[];
};

export class PickValidator<
  Validator extends ObjectValidator<any, any, any>,
  Input,
  Output
> extends BaseValidator<Validator, Input, Output> {
  protected async _validate(
    input: any,
    ctx: IValidationContext
  ): Promise<Output> {
    return await this.Validator.validate(input, ctx);
  }

  constructor(
    protected Validator: Validator,
    protected Options: PickValidatorOptions<unknown>
  ) {
    super();

    if (!(this.Validator instanceof ObjectValidator))
      throw new Error("Invalid object validator instance has been provided!");
    else
      this.Validator["Shape"] = Object.entries(this.Validator["Shape"]).reduce(
        (shape, [key, value]) =>
          this.Options.keys?.includes(key) ? { ...shape, [key]: value } : shape,
        {}
      );
  }
}
