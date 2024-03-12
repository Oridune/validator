// deno-lint-ignore-file no-empty-interface no-explicit-any
import { inferInput, inferOutput } from "../../types.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
  ValidatorType,
} from "../base.ts";

export interface IAndValidatorOptions extends IBaseValidatorOptions {}

export class AndValidator<
  Type extends
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>),
  Input,
  Output,
> extends BaseValidator<Type, Input, Output> {
  protected Options: IAndValidatorOptions;
  protected Validators: (
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>)
  )[] = [];

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "and",
      description: this.Description,
      allOf: this.Validators.map((validator) =>
        BaseValidator.resolveValidator(validator)["_toJSON"]()
      ),
    };
  }

  protected _toSample(options?: ISampleDataOptions) {
    return (
      this.Sample ??
        BaseValidator.resolveValidator(this.Validators[0])["_toSample"](options)
    );
  }

  constructor(validators: Type[], options: IAndValidatorOptions = {}) {
    super(ValidatorType.UTILITY, options);

    if (!(validators instanceof Array)) {
      throw new Error("Invalid validators list has been provided!");
    }

    this.Validators = validators;
    this.Options = options;

    this._custom(async (ctx) => {
      ctx.output = ctx.input;

      for (const Validator of this.Validators) {
        ctx.output = await BaseValidator.resolveValidator(Validator).validate(
          ctx.output,
          ctx,
        );
      }
    });
  }

  public and<V extends BaseValidator<any, any, any>>(
    validator: V | (() => V),
  ): AndValidator<Type | V, Input & inferInput<V>, Output & inferOutput<V>> {
    this.Validators.push(validator);
    return this as any;
  }
}
