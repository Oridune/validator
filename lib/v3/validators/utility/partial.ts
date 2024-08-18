// deno-lint-ignore-file no-explicit-any
import type {
  inferInput,
  inferOutput,
  PartialAdvance,
  TModifierValidators,
} from "../../types.ts";
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

export interface IPartialValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
}

type TAllowedValidators =
  | ObjectValidator<any, any, any>
  | RecordValidator<any, any, any>
  | ArrayValidator<any, any, any>
  | TupleValidator<any, any, any>
  | TModifierValidators;

export class PartialValidator<
  Shape extends TAllowedValidators,
  Input = PartialAdvance<inferInput<Shape>>,
  Output = PartialAdvance<inferOutput<Shape>>,
> extends BaseValidator<Shape, Input, Output> {
  static partial = PartialValidator.createFactory(PartialValidator);

  protected Validator: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      options: {
        ...ctx.validatorOptions,
        partial: true,
      },
      internal: true,
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IPartialValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toJSON(
      this.overrideContext(ctx),
    ).schema;
  }

  protected _toSample(ctx?: ISampleDataContext<IPartialValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toSample(
      this.overrideContext(ctx),
    ).data;
  }

  protected _toStatic(
    ctx?: IStaticContext<IPartialValidatorOptions>,
  ): BaseValidator<Shape, Input, Output> {
    return BaseValidator.resolveValidator(this.Validator).toStatic(
      this.overrideContext(ctx),
    );
  }

  constructor(
    validator: Shape | (() => Shape),
    options?: IPartialValidatorOptions,
  ) {
    super(ValidatorType.UTILITY, "partial", options);

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
