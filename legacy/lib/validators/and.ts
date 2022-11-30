// deno-lint-ignore-file no-explicit-any
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
} from "./base.ts";

// deno-lint-ignore ban-types
export type AndValidatorOptions = {};

export class AndValidator<Validator, Input, Output> extends BaseValidator<
  Validator,
  Input,
  Output
> {
  protected Validators: BaseValidator<any, any, any>[] = [];

  protected _toJSON(_options?: JSONSchemaOptions) {
    return {
      type: "and",
      description: this.Description,
      allOf: this.Validators.map((validator) => validator["_toJSON"]()),
    };
  }

  protected async _validate(
    input: any,
    ctx: IValidationContext
  ): Promise<Output> {
    let Result: any = input;

    for (const Validator of this.Validators)
      if (Validator instanceof BaseValidator)
        Result = ctx.output = await Validator.validate(input, ctx);

    return Result;
  }

  constructor(validators: Validator[], protected Options: AndValidatorOptions) {
    super();

    if (!(validators instanceof Array))
      throw new Error("Invalid validators list has been provided!");

    validators.forEach((validator) => {
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");

      this.Validators.push(validator);
    });
  }
}
