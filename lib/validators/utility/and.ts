// deno-lint-ignore-file no-empty-interface no-explicit-any
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface IAndValidatorOptions extends IBaseValidatorOptions {}

export class AndValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IAndValidatorOptions;
  protected Validators: BaseValidator<any, any, any>[] = [];

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "and",
      description: this.Description,
      allOf: this.Validators.map((validator) => validator["_toJSON"]()),
    };
  }

  constructor(validators: Type[], options: IAndValidatorOptions = {}) {
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

      for (const Validator of this.Validators)
        if (Validator instanceof BaseValidator)
          ctx.output = await Validator.validate(ctx.output, ctx);
    });
  }
}
