// deno-lint-ignore-file no-explicit-any
import {
  BaseValidator,
  IJSONSchemaOptions,
  IValidatorContext,
} from "../base.ts";

export interface IOptionalValidatorOptions {
  nullish?: boolean;
}

export type IDefaultValueType<D> = D extends (
  ctx: IValidatorContext
) => Promise<infer T>
  ? T
  : D extends (ctx: IValidatorContext) => infer T
  ? T
  : D;

export class OptionalValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IOptionalValidatorOptions;
  protected Validator: BaseValidator<any, any, any>;
  protected Default?: {
    value: any;
    validate: boolean;
  };

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return this.Validator["_toJSON"]();
  }

  constructor(validator: Type, options: IOptionalValidatorOptions = {}) {
    super({});

    if (!(validator instanceof BaseValidator))
      throw new Error("Invalid validator instance has been provided!");

    this.Options = options;
    this.Validator = validator;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (
        ctx.output !== undefined &&
        (this.Options.nullish !== true ||
          (this.Options.nullish && !!ctx.output))
      )
        return await this.Validator.validate(ctx.output, ctx);

      const DefaultValue =
        typeof this.Default?.value === "function"
          ? await this.Default?.value(ctx)
          : this.Default?.value;

      if (this.Default?.validate)
        return await this.Validator.validate(DefaultValue, ctx);

      return DefaultValue;
    });
  }

  public default<
    DefaultInput extends (ctx: IValidatorContext) => any,
    Validate extends boolean = false
  >(
    value: DefaultInput,
    options?: {
      validate?: Validate;
    }
  ): OptionalValidator<
    Type,
    Input,
    Validate extends true
      ? Exclude<Output, undefined>
      : IDefaultValueType<DefaultInput> | Exclude<Output, undefined>
  >;
  public default<DefaultInput, Validate extends boolean = false>(
    value: DefaultInput,
    options?: {
      validate?: Validate;
    }
  ): OptionalValidator<
    Type,
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
    Type,
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
