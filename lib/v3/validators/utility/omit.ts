// deno-lint-ignore-file no-explicit-any
import type { inferInput, inferOutput, OmitAdvance } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";
import type { ObjectValidator } from "../non-primitives/object.ts";

export interface IOmitValidatorOptions
  extends Omit<TBaseValidatorOptions, "cast" | "optional"> {
}

type TAllowedValidators = ObjectValidator<any, any, any>;

export class OmitValidator<
  Shape extends TAllowedValidators,
  Input = inferInput<Shape>,
  Output = inferOutput<Shape>,
> extends BaseValidator<Shape, Input, Output> {
  static omit = <
    Validator extends TAllowedValidators,
    Keys extends string,
    Input = inferInput<Validator>,
    Output = inferOutput<Validator>,
  >(
    validator: Validator | (() => Validator),
    keys: Keys[],
    opts?: IOmitValidatorOptions,
  ): OmitValidator<
    Validator,
    OmitAdvance<Input, Keys extends keyof Input ? Keys : never>,
    OmitAdvance<Output, Keys extends keyof Output ? Keys : never>
  > => new OmitValidator(validator, keys, opts) as any;

  protected Validator: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      options: {
        ...ctx.validatorOptions,
        omitKeys: this.Keys,
      },
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IOmitValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toJSON(
      this.overrideContext(ctx),
    ).schema;
  }

  protected _toSample(ctx?: ISampleDataContext<IOmitValidatorOptions>) {
    return BaseValidator.resolveValidator(this.Validator).toSample(
      this.overrideContext(ctx),
    ).data;
  }

  protected _toStatic(
    ctx?: IStaticContext<IOmitValidatorOptions>,
  ): BaseValidator<Shape, Input, Output> {
    return BaseValidator.resolveValidator(this.Validator).toStatic(
      this.overrideContext(ctx),
    );
  }

  constructor(
    validator: Shape | (() => Shape),
    protected Keys: string[],
    options?: IOmitValidatorOptions,
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
