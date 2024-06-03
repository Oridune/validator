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
    return {
      ...ctx,
      options: ctx.validatorOptions,
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IOrValidatorOptions>) {
    return {
      type: "or",
      description: this.Description,
      anyOf: this.Validators.map((validator) =>
        BaseValidator.resolveValidator(validator).toJSON(
          this.overrideContext(ctx),
        ).schema
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
    return OrValidator.or(
      this.Validators.map((validator) => {
        const Validator = BaseValidator.resolveValidator(validator);
        return Validator.toStatic(this.overrideContext(ctx));
      }),
      ctx?.validatorOptions,
    );
  }

  constructor(validators: Shape[], options?: IOrValidatorOptions) {
    super(ValidatorType.UTILITY, options);

    if (!(validators instanceof Array)) {
      throw new Error("Invalid validators list has been provided!");
    }

    this.Validators = validators;

    this._custom(async (ctx) => {
      let Exception: ValidationException | undefined;

      const Validators = await Promise.all(
        this.Validators.map(BaseValidator.resolveValidator),
      );

      if (ctx.validatorOptions?.disableValidatorSorting !== true) {
        Validators.sort((a, b) => {
          // Check if a or b is a StringValidator
          const isStringA = a instanceof StringValidator;
          const isStringB = b instanceof StringValidator;

          return (isStringA && !isStringB)
            ? 1
            : (!isStringA && isStringB)
            ? -1
            : 0;
        });
      }

      for (const Validator of Validators) {
        try {
          return ctx.output = await Validator
            .validate(
              ctx.output,
              this.overrideContext(ctx),
            );
        } catch (error) {
          Exception = new ValidationException().pushIssues(error);
        }
      }

      throw Exception ?? new Error("Something went wrong!");
    });
  }

  public or<V extends BaseValidator<any, any, any>>(
    validator: V | (() => V),
  ): OrValidator<
    Shape | V,
    Input | inferInput<V>,
    Output | inferOutput<V>
  > {
    if (!(validator instanceof BaseValidator)) {
      throw new Error("Invalid validator instance has been provided!");
    }

    this.Validators.push(validator);

    return this as any;
  }
}
