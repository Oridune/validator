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

export interface IDeepOptions extends Omit<TBaseValidatorOptions, "optional"> {
}

export class DeepOptionsValidator<
  Shape extends BaseValidator<any, any, any>,
  Input = inferInput<Shape>,
  Output = inferOutput<Shape>,
> extends BaseValidator<Shape, Input, Output> {
  static deepOptions = BaseValidator.createFactory(DeepOptionsValidator);

  protected Validator: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      deepOptions: ctx.validatorOptions,
      internal: true,
    };
  }

  protected override _toJSON(
    ctx?: IJSONSchemaContext<IDeepOptions>,
  ) {
    return BaseValidator.resolveValidator(this.Validator).toJSON(
      this.overrideContext(ctx),
    ).schema;
  }

  protected override _toSample(
    ctx?: ISampleDataContext<IDeepOptions>,
  ) {
    return BaseValidator.resolveValidator(this.Validator).toSample(
      this.overrideContext(ctx),
    ).data;
  }

  protected override _toStatic(
    ctx?: IStaticContext<IDeepOptions>,
  ): BaseValidator<Shape, Input, Output> {
    return BaseValidator.resolveValidator(this.Validator).toStatic(
      this.overrideContext(ctx),
    );
  }

  constructor(
    validator: Shape | (() => Shape),
    options?: IDeepOptions,
  ) {
    super(ValidatorType.UTILITY, "deepOptions", options);

    this.Validator = validator;

    this._custom(async (ctx) => {
      const Validator = BaseValidator.resolveValidator(this.Validator);

      ctx.output = await Validator.validate(
        ctx.output,
        this.overrideContext(ctx),
      );
    }, true);
  }
}
