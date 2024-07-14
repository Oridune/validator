// deno-lint-ignore-file no-explicit-any
import type {
  DeepRequired,
  inferInput,
  inferOutput,
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

export interface IDeepRequiredValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
}

type TAllowedValidators =
  | ObjectValidator<any, any, any>
  | RecordValidator<any, any, any>
  | ArrayValidator<any, any, any>
  | TupleValidator<any, any, any>
  | TModifierValidators;

export class DeepRequiredValidator<
  Shape extends TAllowedValidators,
  Input = DeepRequired<inferInput<Shape>>,
  Output = DeepRequired<inferOutput<Shape>>,
> extends BaseValidator<Shape, Input, Output> {
  static deepRequired = BaseValidator.createFactory(DeepRequiredValidator);

  protected Validator: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      deepOptions: {
        ...ctx.deepOptions,
        required: true,
      },
      options: {
        ...ctx.validatorOptions,
        required: true,
      },
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IDeepRequiredValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toJSON(
      this.overrideContext(ctx),
    ).schema;
  }

  protected _toSample(ctx?: ISampleDataContext<IDeepRequiredValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toSample(
      this.overrideContext(ctx),
    ).data;
  }

  protected _toStatic(
    ctx?: IStaticContext<IDeepRequiredValidatorOptions>,
  ): BaseValidator<Shape, Input, Output> {
    return BaseValidator.resolveValidator(this.Validator).toStatic(
      this.overrideContext(ctx),
    );
  }

  constructor(
    validator: Shape | (() => Shape),
    options?: IDeepRequiredValidatorOptions,
  ) {
    super(ValidatorType.UTILITY, "deepRequired", options);

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
