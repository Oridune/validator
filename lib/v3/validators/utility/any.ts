// deno-lint-ignore-file no-explicit-any
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export interface IAnyValidatorOptions extends TBaseValidatorOptions {}

export class AnyValidator<
  Shape extends any = any,
  Input extends any = any,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static any = AnyValidator.createFactory(AnyValidator);

  static value = <T>(value: T, options?: IAnyValidatorOptions) =>
    AnyValidator.any(options).custom(() => value) as AnyValidator<any, T, T>;

  protected _toJSON(ctx?: IJSONSchemaContext<IAnyValidatorOptions>) {
    return {
      type: "any",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(_ctx?: ISampleDataContext<IAnyValidatorOptions>) {
    return this.Sample ?? ({} as Input);
  }

  constructor(options?: IAnyValidatorOptions) {
    super(ValidatorType.UTILITY, options);
  }
}
