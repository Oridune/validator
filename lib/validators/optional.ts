// deno-lint-ignore-file no-explicit-any
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
} from "./base.ts";

export type OptionalValidatorOptions = {
  nullish?: boolean;
};

export type DefaultValueType<D> = D extends (
  ctx: IValidationContext
) => Promise<infer T>
  ? T
  : D extends (ctx: IValidationContext) => infer T
  ? T
  : D;

export class OptionalValidator<Validator, Input, Output> extends BaseValidator<
  Validator,
  Input,
  Output
> {
  protected Validator: BaseValidator<any, any, any>;
  protected Default?: {
    value: any;
    validate: boolean;
  };

  protected _toJSON(_options?: JSONSchemaOptions) {
    return this.Validator["_toJSON"]();
  }

  protected async _validate(
    input: any,
    ctx: IValidationContext
  ): Promise<Output> {
    if (
      input !== undefined &&
      (this.Options.nullish !== true || (this.Options.nullish && !!input))
    )
      return await this.Validator.validate(input, ctx);

    const DefaultValue =
      typeof this.Default?.value === "function"
        ? await this.Default?.value(ctx)
        : this.Default?.value;

    if (this.Default?.validate)
      return await this.Validator.validate(DefaultValue, ctx);

    return DefaultValue;
  }

  constructor(
    validator: Validator,
    protected Options: OptionalValidatorOptions
  ) {
    super();

    if (!(validator instanceof BaseValidator))
      throw new Error("Invalid validator instance has been provided!");

    this.Validator = validator;
  }

  public default<
    DefaultInput extends (ctx: IValidationContext) => any,
    Validate extends boolean = false
  >(
    value: DefaultInput,
    options?: {
      validate?: Validate;
    }
  ): OptionalValidator<
    Validator,
    Input,
    Validate extends true
      ? Exclude<Output, undefined>
      : DefaultValueType<DefaultInput> | Exclude<Output, undefined>
  >;
  public default<DefaultInput, Validate extends boolean = false>(
    value: DefaultInput,
    options?: {
      validate?: Validate;
    }
  ): OptionalValidator<
    Validator,
    Input,
    Validate extends true
      ? Exclude<Output, undefined>
      : DefaultInput | Exclude<Output, undefined>
  >;
  public default<DefaultInput, Validate extends boolean = false>(
    value: DefaultInput,
    options?: {
      validate?: Validate;
    }
  ): OptionalValidator<
    Validator,
    Input,
    Validate extends true
      ? Exclude<Output, undefined>
      : DefaultInput | Exclude<Output, undefined>
  > {
    if (typeof this.Default === "object")
      throw new Error(`Cannot call a default method multiple times!`);

    this.Default = {
      value,
      validate: options?.validate ?? false,
    };

    return this as any;
  }
}
