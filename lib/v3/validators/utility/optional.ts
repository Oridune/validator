// deno-lint-ignore-file no-explicit-any
import type { inferInput, inferOutput } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type IValidatorContext,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export type IDefaultValueType<D> = D extends (
  ctx: IValidatorContext,
) => Promise<infer T> ? T
  : D extends (ctx: IValidatorContext) => infer T ? T
  : D;

export interface IOptionalValidatorOptions extends TBaseValidatorOptions {
  noDefaults?: boolean;
}

export class OptionalValidator<
  Shape extends BaseValidator<any, any, any>,
  Input = inferInput<Shape> | undefined,
  Output = inferOutput<Shape> | undefined,
> extends BaseValidator<Shape, Input, Output> {
  static optional = BaseValidator.createFactory(OptionalValidator);

  protected Validator: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    if (ctx.validatorOptions.noDefaults) {
      delete ctx.validatorOptions?.optionalOptions.default;
    }

    return {
      ...ctx,
      options: {
        ...ctx.validatorOptions,

        optional: ctx.validatorOptions?.optional ?? true,
        optionalOptions: ctx.validatorOptions?.optionalOptions,
      },
      internal: true,
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IOptionalValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toJSON(
      this.overrideContext(ctx),
    ).schema;
  }

  protected _toSample(ctx?: ISampleDataContext<IOptionalValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toSample(
      this.overrideContext(ctx),
    ).data;
  }

  protected _toStatic(
    ctx?: IStaticContext<IOptionalValidatorOptions>,
  ): BaseValidator<Shape, Input, Output> {
    return BaseValidator.resolveValidator(this.Validator).toStatic(
      this.overrideContext(ctx),
    );
  }

  constructor(
    validator: Shape | (() => Shape),
    options?: IOptionalValidatorOptions,
  ) {
    super(ValidatorType.UTILITY, "optional", options);

    this.Validator = validator;

    this._custom(async (ctx) => {
      const Validator = BaseValidator.resolveValidator(this.Validator);

      ctx.output = await Validator.validate(
        ctx.output,
        this.overrideContext(ctx),
      );
    }, true);
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
    Shape,
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
    Shape,
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
    Shape,
    Input,
    Validate extends true ? Exclude<Output, undefined>
      : DefaultInput | Exclude<Output, undefined>
  > {
    if (this["ValidatorOptions"].optional !== false) {
      const OptionalOptions = (this["ValidatorOptions"].optionalOptions ??= {});

      OptionalOptions.default = value;
      OptionalOptions.validate = options?.validate;
    }

    return this as any;
  }
}
