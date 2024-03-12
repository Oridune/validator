// deno-lint-ignore-file no-explicit-any
import {
  BaseValidator,
  IJSONSchemaOptions,
  ISampleDataOptions,
  IValidatorContext,
  ValidatorType,
} from "../base.ts";
import { AnyValidator } from "./any.ts";

export interface IOptionalValidatorOptions {
  nullish?: boolean;
  deletePropertyIfUndefined?: boolean;
}

export type IDefaultValueType<D> = D extends (
  ctx: IValidatorContext,
) => Promise<infer T> ? T
  : D extends (ctx: IValidatorContext) => infer T ? T
  : D;

export class OptionalValidator<
  Type extends
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>),
  Input,
  Output,
> extends BaseValidator<Type, Input, Output> {
  protected Options: IOptionalValidatorOptions;
  protected Validator: Type;
  protected Default?: {
    value: any;
    validate: boolean;
  };

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return BaseValidator.resolveValidator(this.Validator)["_toJSON"]();
  }

  protected _toSample(options?: ISampleDataOptions) {
    return (
      this.Sample ??
        BaseValidator.resolveValidator(this.Validator)["_toSample"](options)
    );
  }

  constructor(validator: Type, options: IOptionalValidatorOptions = {}) {
    super(ValidatorType.UTILITY, {});

    this.Options = options;
    this.Validator = validator;

    this._custom(async (ctx) => {
      ctx.output = ctx.input;

      const Validator = BaseValidator.resolveValidator(this.Validator);

      if (
        Validator instanceof AnyValidator ||
        (ctx.output !== undefined &&
          (this.Options.nullish !== true ||
            (this.Options.nullish && !!ctx.output)))
      ) {
        return await Validator.validate(ctx.output, ctx);
      }

      const DefaultValue = typeof this.Default?.value === "function"
        ? await this.Default?.value(ctx)
        : this.Default?.value;

      if (this.Default?.validate) {
        return await Validator.validate(DefaultValue, ctx);
      }

      return DefaultValue;
    });
  }

  public default<
    DefaultInput extends (ctx: IValidatorContext) => any,
    Validate extends boolean = false,
  >(
    value: DefaultInput,
    options?: {
      validate?: Validate;
    },
  ): OptionalValidator<
    Type,
    Input,
    Validate extends true ? Exclude<Output, undefined>
      : IDefaultValueType<DefaultInput> | Exclude<Output, undefined>
  >;
  public default<DefaultInput, Validate extends boolean = false>(
    value: DefaultInput,
    options?: {
      validate?: Validate;
    },
  ): OptionalValidator<
    Type,
    Input,
    Validate extends true ? Exclude<Output, undefined>
      : DefaultInput | Exclude<Output, undefined>
  >;
  public default<DefaultInput, Validate extends boolean = false>(
    value: DefaultInput,
    options?: {
      validate?: Validate;
    },
  ): OptionalValidator<
    Type,
    Input,
    Validate extends true ? Exclude<Output, undefined>
      : DefaultInput | Exclude<Output, undefined>
  > {
    if (typeof this.Default === "object") {
      throw new Error(`Cannot call a default method multiple times!`);
    }

    this.Default = {
      value,
      validate: options?.validate ?? false,
    };

    return this as any;
  }
}
