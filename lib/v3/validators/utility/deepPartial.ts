// deno-lint-ignore-file no-explicit-any
import type { DeepPartial, inferInput, inferOutput } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";
import type { ArrayValidator } from "../non-primitives/array.ts";
import type { ObjectValidator } from "../non-primitives/object.ts";
import type { RecordValidator } from "../non-primitives/record.ts";
import type { TupleValidator } from "../non-primitives/tuple.ts";

export interface IDeepPartialValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
}

export class DeepPartialValidator<
  Shape extends
    | ObjectValidator<any, any, any>
    | RecordValidator<any, any, any>
    | ArrayValidator<any, any, any>
    | TupleValidator<any, any, any>,
  Input = DeepPartial<inferInput<Shape>>,
  Output = DeepPartial<inferOutput<Shape>>,
> extends BaseValidator<Shape, Input, Output> {
  static deepPartial = BaseValidator.createFactory(DeepPartialValidator);

  protected Validator: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      deepOptions: { partial: true },
      options: { ...ctx.validatorOptions, partial: true },
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IDeepPartialValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toJSON(
      this.overrideContext(ctx),
    ).schema;
  }

  protected _toSample(ctx?: ISampleDataContext<IDeepPartialValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toSample(
      this.overrideContext(ctx),
    ).data;
  }

  protected _toStatic(
    ctx?: IStaticContext<IDeepPartialValidatorOptions>,
  ): BaseValidator<Shape, Input, Output> {
    return BaseValidator.resolveValidator(this.Validator).toStatic(
      this.overrideContext(ctx),
    );
  }

  constructor(
    validator: Shape | (() => Shape),
    options?: IDeepPartialValidatorOptions,
  ) {
    super(ValidatorType.UTILITY, options);

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
