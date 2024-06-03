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
    return {
      ...ctx,
      options: ctx?.validatorOptions,
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IAndValidatorOptions>) {
    return {
      type: "and",
      description: this.Description,
      allOf: this.Validators.map((validator) =>
        BaseValidator.resolveValidator(validator).toJSON(
          this.overrideContext(ctx),
        ).schema
      ),
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(ctx?: ISampleDataContext<IAndValidatorOptions>) {
    return (
      this.Sample ??
        BaseValidator.resolveValidator(this.Validators[0]).toSample(
          this.overrideContext(ctx),
        ).data
    );
  }

  protected _toStatic(
    ctx?: IStaticContext<IAndValidatorOptions>,
  ): AndValidator<Shape, Input, Output> {
    return AndValidator.and(
      this.Validators.map((validator) => {
        const Validator = BaseValidator.resolveValidator(validator);
        return Validator.toStatic(this.overrideContext(ctx));
      }),
      ctx?.validatorOptions,
    );
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
      for (const Validator of this.Validators) {
        ctx.output = await BaseValidator.resolveValidator(Validator).validate(
          ctx.output,
          this.overrideContext(ctx),
        );
      }
    });
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
