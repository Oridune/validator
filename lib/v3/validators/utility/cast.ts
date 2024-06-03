// deno-lint-ignore-file no-explicit-any
import type { inferInput, inferOutput } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export interface ICastValidatorOptions
  extends Omit<TBaseValidatorOptions, "optional"> {
  deepCast?: boolean;
}

export class CastValidator<
  Shape extends BaseValidator<any, any, any>,
  Input = inferInput<Shape>,
  Output = inferOutput<Shape>,
> extends BaseValidator<Shape, Input, Output> {
  static cast = BaseValidator.createFactory(CastValidator);

  static deepCast = <
    Shape extends BaseValidator<any, any, any>,
  >(validator: Shape, options?: Omit<ICastValidatorOptions, "deepCast">) =>
    CastValidator.cast(validator, { ...options, deepCast: true });

  protected Validator: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      ...(ctx.validatorOptions?.deepCast
        ? {
          deepOptions: {
            ...ctx.deepOptions,
            cast: ctx.validatorOptions?.cast ?? true,
          },
        }
        : {}),
      options: {
        ...ctx.validatorOptions,
        cast: ctx.validatorOptions?.cast ?? true,
      },
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<ICastValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toJSON(
      this.overrideContext(ctx),
    ).schema;
  }

  protected _toSample(ctx?: ISampleDataContext<ICastValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toSample(
      this.overrideContext(ctx),
    ).data;
  }

  protected _toStatic(
    ctx?: IStaticContext<ICastValidatorOptions>,
  ): BaseValidator<Shape, Input, Output> {
    return BaseValidator.resolveValidator(this.Validator).toStatic(
      this.overrideContext(ctx),
    );
  }

  constructor(
    validator: Shape | (() => Shape),
    options?: ICastValidatorOptions,
  ) {
    super(ValidatorType.UTILITY, "cast", options);

    this.Validator = validator;

    this._custom(async (ctx) => {
      const Validator = BaseValidator.resolveValidator(this.Validator);

      ctx.output = await Validator.validate(
        ctx.output,
        this.overrideContext(ctx),
      );
    });
  }
}
