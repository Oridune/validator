// deno-lint-ignore-file no-explicit-any
import e from "../../mod.ts";
import { BaseValidator, IValidationContext } from "./base.ts";
import { ObjectValidator } from "./object.ts";
import { OptionalValidatorOptions } from "./optional.ts";

export type PartialValidatorOptions<Ignore> = {
  ignore?: Ignore[];
} & OptionalValidatorOptions;

export class PartialValidator<
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
    protected Options: PartialValidatorOptions<unknown>
  ) {
    super();

    if (!(this.Validator instanceof ObjectValidator))
      throw new Error("Invalid object validator instance has been provided!");
    else
      this.Validator["Shape"] = Object.entries(this.Validator["Shape"]).reduce(
        (shape, [key, value]) => ({
          ...shape,
          [key]: this.Options.ignore?.includes(key)
            ? value
            : e.optional(value, this.Options),
        }),
        {}
      );
  }
}
