// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../../exceptions.ts";
import type { inferInput, inferOutput } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";
import { StringValidator } from "../primitives/string.ts";

export interface IOrValidatorOptions extends TBaseValidatorOptions {
  /**
   * By default all the string validators are moved at the end of the union validators for better validator matching.
   *
   * Pass `true` to disable validators sorting.
   */
  disableValidatorSorting?: boolean;
}

export class OrValidator<
  Shape extends
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>),
  Input = inferInput<Shape>,
  Output = inferOutput<Shape>,
> extends BaseValidator<Shape, Input, Output> {
  static or = OrValidator.createFactory(OrValidator);

  protected Validators: (
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>)
  )[] = [];

  protected overrideContext(ctx: any) {
    if (!ctx.validatorOptions) return ctx;

    return {
      ...ctx,
      options: ctx.validatorOptions,
      internal: true,
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IOrValidatorOptions>) {
    const Context = this.overrideContext(ctx);

    return {
      type: "or",
      description: this.Description,
      anyOf: this.Validators.map(
        (validator) =>
          BaseValidator.resolveValidator(validator).toJSON(Context).schema,
      ),
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(ctx?: ISampleDataContext<IOrValidatorOptions>) {
    return (
      this.Sample ??
        BaseValidator.resolveValidator(
          this.Validators[Math.floor(Math.random() * this.Validators.length)],
        ).toSample(this.overrideContext(ctx)).data
    );
  }

  protected _toStatic(
    ctx?: IStaticContext<IOrValidatorOptions>,
  ): OrValidator<Shape, Input, Output> {
    const Context = this.overrideContext(ctx);

    return OrValidator.or(
      this.Validators.map((validator) =>
        BaseValidator.resolveValidator(validator).toStatic(Context)
      ),
      ctx?.validatorOptions,
    ) as any;
  }

  constructor(validators: Shape[], options?: IOrValidatorOptions) {
    super(ValidatorType.UTILITY, "or", options);

    if (!(validators instanceof Array)) {
      throw new Error("Invalid validators list has been provided!");
    }

    this.Validators = validators;

    this._custom(async (ctx) => {
      let Exception: ValidationException | undefined;

      const Validators = await Promise.all(
        this.Validators.map((v) => BaseValidator.resolveValidator(v)),
      );

      if (ctx.validatorOptions?.disableValidatorSorting !== true) {
        Validators.sort((a, b) => {
          // Check if a or b is a StringValidator
          const isStringA = a instanceof StringValidator;
          const isStringB = b instanceof StringValidator;

          return isStringA && !isStringB ? 1 : !isStringA && isStringB ? -1 : 0;
        });
      }

      const Context = this.overrideContext(ctx);

      for (const Validator of Validators) {
        try {
          return (ctx.output = await Validator.validate(ctx.output, Context));
        } catch (error) {
          Exception = new ValidationException().pushIssues(error);
        }
      }

      throw Exception ?? new Error("Something went wrong!");
    }, true);
  }

  public or<V extends BaseValidator<any, any, any>>(
    validator: V | (() => V),
  ): OrValidator<Shape | V, Input | inferInput<V>, Output | inferOutput<V>> {
    if (!(validator instanceof BaseValidator)) {
      throw new Error("Invalid validator instance has been provided!");
    }

    this.Validators.push(validator);

    return this as any;
  }
}
