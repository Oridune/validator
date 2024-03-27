// deno-lint-ignore-file no-empty-interface no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import { inferInput, inferOutput } from "../../types.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
  ValidatorType,
} from "../base.ts";

export interface IOrValidatorOptions extends IBaseValidatorOptions {}

export class OrValidator<
  Type extends
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>),
  Input,
  Output,
> extends BaseValidator<Type, Input, Output> {
  protected Options: IOrValidatorOptions;
  protected Validators: (
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>)
  )[] = [];

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "or",
      description: this.Description,
      anyOf: this.Validators.map((validator) =>
        BaseValidator.resolveValidator(validator)["_toJSON"]()
      ),
    };
  }

  protected _toSample(options?: ISampleDataOptions) {
    return (
      this.Sample ??
        BaseValidator.resolveValidator(
          this.Validators[Math.floor(Math.random() * this.Validators.length)],
        )["_toSample"](options)
    );
  }

  constructor(validators: Type[], options: IOrValidatorOptions = {}) {
    super(ValidatorType.UTILITY, options);

    this.Options = options;

    if (!(validators instanceof Array)) {
      throw new Error("Invalid validators list has been provided!");
    }

    this.Validators = validators;

    this._custom(async (ctx) => {
      const Exception = new ValidationException();

      for (const Validator of this.Validators) {
        try {
          return await BaseValidator.resolveValidator(Validator).validate(
            ctx.output,
            ctx,
          );
        } catch (error) {
          Exception.pushIssues(error);
        }
      }

      throw Exception;
    });
  }

  public or<V extends BaseValidator<any, any, any>>(
    validator: V | (() => V),
  ): OrValidator<Type | V, Input | inferInput<V>, Output | inferOutput<V>> {
    if (!(validator instanceof BaseValidator)) {
      throw new Error("Invalid validator instance has been provided!");
    }

    this.Validators.push(validator);

    return this as any;
  }
}
