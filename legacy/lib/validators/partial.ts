// deno-lint-ignore-file no-explicit-any
import e from "../../mod.ts";
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
} from "./base.ts";
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
  protected Validator: BaseValidator<any, any, any>;

  protected _toJSON(_options?: JSONSchemaOptions) {
    return this.Validator["_toJSON"]();
  }

  protected async _validate(
    input: any,
    ctx: IValidationContext
  ): Promise<Output> {
    return await this.Validator.validate(input, ctx);
  }

  constructor(
    validator: Validator,
    protected Options: PartialValidatorOptions<unknown>
  ) {
    super();

    if (!(validator instanceof ObjectValidator))
      throw new Error("Invalid object validator instance has been provided!");
    else
      validator["Shape"] = Object.entries(validator["Shape"]).reduce(
        (shape, [key, value]) => ({
          ...shape,
          [key]: this.Options.ignore?.includes(key)
            ? value
            : e.optional(value, this.Options),
        }),
        {}
      );

    this.Validator = validator;
  }
}
