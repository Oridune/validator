// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../../exceptions.ts";
import type { inferInput, inferOutput, TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type IValidatorContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export interface IArrayValidatorOptions extends TBaseValidatorOptions {
  partial?: boolean;
  required?: boolean;

  /**
   * Requires `cast` to be `true`
   */
  splitter?: string | RegExp;

  /**
   * Requires `cast` to be `true`
   */
  ignoreNanKeys?: boolean;

  /**
   * Requires `cast` and `ignoreNanKeys` to be `true`
   */
  pushNanKeys?: boolean;

  /**
   * Requires `cast` to be `true`
   */
  noCastSingularToArray?: boolean;
  messages?: Partial<
    Record<"typeError" | "smallerLength" | "greaterLength", TErrorMessage>
  >;
  minLength?: number;
  maxLength?: number;
}

export class ArrayValidator<
  Shape extends BaseValidator<any, any, any>,
  Input extends any[] = inferInput<Shape>[],
  Output = inferOutput<Shape>[],
> extends BaseValidator<Shape, Input, Output> {
  static array = ArrayValidator.createFactory(ArrayValidator);

  protected Validator?: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      ...(ctx.validatorOptions?.partial
        ? { options: { optional: true } }
        : ctx.validatorOptions?.required
        ? { options: { optional: false } }
        : {}),
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IArrayValidatorOptions>) {
    const Validator = this.Validator &&
      BaseValidator.resolveValidator(this.Validator);

    return {
      type: "array",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      minLength: ctx?.validatorOptions?.minLength,
      maxLength: ctx?.validatorOptions?.maxLength,
      items: Validator?.toJSON(this.overrideContext(ctx)).schema,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(ctx?: ISampleDataContext<IArrayValidatorOptions>) {
    const Output = ([] as any[]) as Input;

    if (this.Validator) {
      const Validator = BaseValidator.resolveValidator(this.Validator);

      for (let i = 0; i < (ctx?.validatorOptions?.maxLength ?? 1); i++) {
        Output.push(Validator.toSample(this.overrideContext(ctx)).data);
      }
    }

    return this.Sample ?? Output;
  }

  protected _toStatic(
    ctx?: IStaticContext<IArrayValidatorOptions>,
  ): ArrayValidator<Shape, Input, Output> {
    const Validator = BaseValidator.resolveValidator(this.Validator);

    return ArrayValidator.array(
      Validator.toStatic(this.overrideContext(ctx)) as Shape,
      ctx?.validatorOptions,
    );
  }

  protected async _cast(ctx: IValidatorContext<any, any>): Promise<void> {
    const Err = await this._resolveErrorMessage(
      ctx.validatorOptions?.messages?.typeError,
      "Invalid array has been provided!",
    );

    if (typeof ctx.output === "string") {
      try {
        ctx.output = JSON.parse(ctx.output);
        return;
      } catch {
        if (ctx.validatorOptions?.splitter) {
          ctx.output = ctx.output.toString().split(
            ctx.validatorOptions?.splitter,
          );
          return;
        }
      }
    }

    if (ctx.output instanceof Array) return;

    if (
      typeof ctx.output === "object" &&
      ctx.output !== null &&
      ctx.output.constructor === Object
    ) {
      try {
        ctx.output = Object.keys(ctx.output).reduce((array, key) => {
          const Key = parseInt(key);

          if (isNaN(Key)) {
            if (ctx.validatorOptions?.ignoreNanKeys) {
              if (ctx.validatorOptions?.pushNanKeys) {
                array.push(ctx.output[key]);
              }

              return array;
            }

            throw Err;
          }

          array[Key] = ctx.output[key];

          return array;
        }, [] as any[]);

        return;
      } catch {
        // Do nothing...
      }
    }

    if (ctx.validatorOptions?.noCastSingularToArray) throw Err;

    ctx.output = [ctx.output];
  }

  constructor(
    validator?: Shape | (() => Shape),
    options?: IArrayValidatorOptions,
  ) {
    super(ValidatorType.NON_PRIMITIVE, options);

    this.Validator = validator;

    this._custom(async (ctx) => {
      if (!(ctx.output instanceof Array)) {
        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid array has been provided!",
        );
      }

      if (typeof ctx.validatorOptions?.minLength === "number") {
        if (ctx.output.length < ctx.validatorOptions.minLength) {
          throw await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.smallerLength,
            "Array is smaller than minimum length!",
          );
        }
      }

      if (typeof ctx.validatorOptions?.maxLength === "number") {
        if (ctx.output.length > ctx.validatorOptions.maxLength) {
          throw await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.greaterLength,
            "Array is greater than maximum length!",
          );
        }
      }

      ctx.output = [...ctx.output];

      const Exception = new ValidationException();

      if (this.Validator) {
        const Validator = BaseValidator.resolveValidator(this.Validator);

        for (const [Index, Input] of Object.entries(ctx.output)) {
          try {
            const Location = `${ctx.location}.${Index}`;

            const Key = parseInt(Index);

            ctx.output[Key] = await Validator.validate(Input, {
              ...this.overrideContext(ctx),
              location: Location,
              index: Key,
              property: Index,
              parent: ctx,
            });
          } catch (error) {
            Exception.pushIssues(error);
          }
        }
      }

      if (Exception.issues.length) throw Exception;
    });
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object"
      ? options
      : { min: options, max: options };

    this["ValidatorOptions"].minLength = Options.min ??
      this["ValidatorOptions"].minLength;
    this["ValidatorOptions"].maxLength = Options.max ??
      this["ValidatorOptions"].maxLength;

    return this;
  }

  public min(length: number) {
    return this.length({ min: length });
  }

  public max(length: number) {
    return this.length({ max: length });
  }
}
