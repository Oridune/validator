// deno-lint-ignore-file no-explicit-any
import type {
  inferEachInput,
  inferEachOutput,
  inferInput,
  inferOutput,
  UnionToIntersection,
} from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export interface IAndValidatorOptions extends TBaseValidatorOptions {}

export class AndValidator<
  Shape extends Array<
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>)
  >,
  Input = UnionToIntersection<inferEachInput<Shape>[number]>,
  Output = UnionToIntersection<inferEachOutput<Shape>[number]>,
> extends BaseValidator<Shape, Input, Output> {
  static and = AndValidator.createFactory(AndValidator);

  protected Validators: (
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>)
  )[] = [];

  protected overrideContext(ctx: any) {
    if (!ctx.validatorOptions) return ctx;

    return {
      ...ctx,
      options: ctx?.validatorOptions,
      internal: true,
    };
  }

  protected override _toJSON(ctx?: IJSONSchemaContext<IAndValidatorOptions>) {
    const Context = this.overrideContext(ctx);

    return {
      type: "and",
      description: this.Description,
      allOf: this.Validators.map((validator) =>
        BaseValidator.resolveValidator(validator).toJSON(
          Context,
        ).schema
      ),
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(ctx?: ISampleDataContext<IAndValidatorOptions>) {
    const Context = this.overrideContext(ctx);

    return (
      this.Sample ??
        BaseValidator.resolveValidator(this.Validators[0]).toSample(
          Context,
        ).data
    );
  }

  protected override _toStatic(
    ctx?: IStaticContext<IAndValidatorOptions>,
  ): AndValidator<Shape, Input, Output> {
    const Context = this.overrideContext(ctx);

    return AndValidator.and(
      this.Validators.map((validator) => {
        const Validator = BaseValidator.resolveValidator(validator);
        return Validator.toStatic(Context);
      }),
      ctx?.validatorOptions,
    ) as any;
  }

  constructor(
    validators: [...Shape],
    options?: IAndValidatorOptions,
  ) {
    super(ValidatorType.UTILITY, "and", options);

    if (!(validators instanceof Array)) {
      throw new Error("Invalid validators list has been provided!");
    }

    this.Validators = validators;

    this._custom(async (ctx) => {
      const Context = this.overrideContext(ctx);

      for (const Validator of this.Validators) {
        ctx.output = await BaseValidator.resolveValidator(Validator).validate(
          ctx.output,
          Context,
        );
      }
    }, true);
  }

  public and<V extends BaseValidator<any, any, any>>(
    validator: V | (() => V),
  ): AndValidator<
    [...Shape, V],
    Input & inferInput<V>,
    Output & inferOutput<V>
  > {
    this.Validators.push(validator);
    return this as any;
  }
}
