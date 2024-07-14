// deno-lint-ignore-file no-explicit-any
import type {
  inferInput,
  inferOutput,
  PickAdvance,
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
import type { ObjectValidator } from "../non-primitives/object.ts";

export interface IPickValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
}

type TAllowedValidators =
  | ObjectValidator<any, any, any>
  | TModifierValidators;

export class PickValidator<
  Shape extends TAllowedValidators,
  Input = inferInput<Shape>,
  Output = inferOutput<Shape>,
> extends BaseValidator<Shape, Input, Output> {
  static pick = <
    Validator extends TAllowedValidators,
    Keys extends string,
    Input = inferInput<Validator>,
    Output = inferOutput<Validator>,
  >(
    validator: Validator | (() => Validator),
    keys: Keys[],
    opts?: IPickValidatorOptions,
  ): PickValidator<
    Validator,
    PickAdvance<Input, Keys extends keyof Input ? Keys : never>,
    PickAdvance<Output, Keys extends keyof Output ? Keys : never>
  > => new PickValidator(validator, keys, opts) as any;

  protected Validator: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      options: {
        ...ctx.validatorOptions,
        pickKeys: this.Keys,
      },
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IPickValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toJSON(
      this.overrideContext(ctx),
    ).schema;
  }

  protected _toSample(ctx?: ISampleDataContext<IPickValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toSample(
      this.overrideContext(ctx),
    ).data;
  }

  protected _toStatic(
    ctx?: IStaticContext<IPickValidatorOptions>,
  ): BaseValidator<Shape, Input, Output> {
    return BaseValidator.resolveValidator(this.Validator).toStatic(
      this.overrideContext(ctx),
    );
  }

  constructor(
    validator: Shape | (() => Shape),
    protected Keys: string[],
    options?: IPickValidatorOptions,
  ) {
    super(ValidatorType.UTILITY, "pick", options);

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
