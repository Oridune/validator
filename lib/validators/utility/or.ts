// deno-lint-ignore-file no-empty-interface no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface IOrValidatorOptions extends IBaseValidatorOptions {}

export class OrValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IOrValidatorOptions;
  protected Validators: BaseValidator<any, any, any>[] = [];

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "or",
      description: this.Description,
      anyOf: this.Validators.map((validator) => validator["_toJSON"]()),
    };
  }

  constructor(validators: Type[], options: IOrValidatorOptions = {}) {
    super(options);

    if (!(validators instanceof Array))
      throw new Error("Invalid validators list has been provided!");

    validators.forEach((validator) => {
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");

      this.Validators.push(validator);
    });

    this.Options = options;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      const Exception = new ValidationException();

      for (const Validator of this.Validators)
        if (Validator instanceof BaseValidator)
          try {
            await Validator.validate(ctx.output, ctx);
            return;
          } catch (error) {
            Exception.pushIssues(error);
          }

      throw Exception;
    });
  }
}
