// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
} from "./base.ts";

// deno-lint-ignore ban-types
export type OrValidatorOptions = {};

export class OrValidator<Validator, Input, Output> extends BaseValidator<
  Validator,
  Input,
  Output
> {
  protected Validators: BaseValidator<any, any, any>[] = [];

  protected _toJSON(_options?: JSONSchemaOptions) {
    return {
      type: "or",
      description: this.Description,
      anyOf: this.Validators.map((validator) => validator["_toJSON"]()),
    };
  }

  protected async _validate(
    input: any,
    ctx: IValidationContext
  ): Promise<Output> {
    const ErrorList: ValidationException[] = [];

    for (const Validator of this.Validators) {
      if (Validator instanceof BaseValidator) {
        try {
          return await Validator.validate(input, ctx);
        } catch (error) {
          ErrorList.push(error as any);
        }
      }
    }

    throw ErrorList;
  }

  constructor(validators: Validator[], protected Options: OrValidatorOptions) {
    super();

    if (!(validators instanceof Array)) {
      throw new Error("Invalid validators list has been provided!");
    }

    validators.forEach((validator) => {
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");

      this.Validators.push(validator);
    });
  }
}
