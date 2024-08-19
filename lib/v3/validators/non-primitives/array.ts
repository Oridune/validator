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
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<
      "typeError" | "nanKey" | "smallerLength" | "greaterLength",
      TErrorMessage
    >
  >;

  /** Validate array minimum length */
  minLength?: number;

  /** Validate array maximum length */
  maxLength?: number;

  /**
   * Partialize the underlying validator (makes undefined values in the props acceptable)
   *
   * Use e.partial() instead, if working with typescript
   */
  partial?: boolean;

  /**
   * Converts the underlying validator's props that are partialized/optional to required
   *
   * Use e.required() instead, if working with typescript
   */
  required?: boolean;

  /**
   * (Casting Option) Requires `cast` to be `true`
   *
   * Set a splitter that will be used to split elements in the string and convert it into array during the cast.
   */
  splitter?: string | RegExp;

  /**
   * (Casting Option) Requires `cast` to be `true`
   *
   * Normally this validator will allow you to validate an object (like an array) if the cast is `true` and
   * properties of this object are number like.
   * But if the validator detects a NaN property on the object, it will throw a nanKey error!
   *
   * If you want to avoid nanKey error by ignoring any NaN keys in the object then pass `true` here.
   */
  ignoreNanKeys?: boolean;

  /**
   * (Casting Option) Requires `cast` to be `true`
   *
   * Normally this validator will allow you to validate an object (like an array) if the cast is `true` and
   * properties of this object are number like.
   * But if the validator detects a NaN property on the object, it will throw a nanKey error!
   *
   * If you want to avoid nanKey error by pushing the value of a NaN key into the resulting array then pass `true` here.
   */
  pushNanKeys?: boolean;

  /**
   * (Casting Option) Requires `cast` to be `true`
   *
   * If `cast` is `true`, the validator will try to convert a non-splitable/non-object item into an array.
   * If you pass boolean (true) into the array validator, it will cast it to [true], an array of boolean.
   *
   * If you want to disable this behavior, pass `true` here.
   */
  noCastSingularToArray?: boolean;
}

export class ArrayValidator<
  Shape extends BaseValidator<any, any, any>,
  Input extends any[] = inferInput<Shape>[],
  Output = inferOutput<Shape>[],
> extends BaseValidator<Shape, Input, Output> {
  static array = ArrayValidator.createFactory(ArrayValidator);

  protected Validator?: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    if (!ctx.validatorOptions) return ctx;

    return {
      ...ctx,
      ...(ctx.validatorOptions?.partial
        ? {
          options: {
            optional: true,
            noDefaults: ctx.validatorOptions.partialNoDefaults ?? false,
          },
          replaceOptions: ctx.validatorOptions.optionalOptions
            ? {
              optionalOptions: ctx.validatorOptions.optionalOptions,
            }
            : undefined,
        }
        : ctx.validatorOptions?.required
        ? { options: { optional: false } }
        : {}),
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IArrayValidatorOptions>) {
    const Validator = this.Validator &&
      BaseValidator.resolveValidator(this.Validator);
    const Context = this.overrideContext(ctx);

    return {
      type: "array",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      minLength: ctx?.validatorOptions?.minLength,
      maxLength: ctx?.validatorOptions?.maxLength,
      items: Validator?.toJSON(Context).schema,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(ctx?: ISampleDataContext<IArrayValidatorOptions>) {
    const Output = ([] as any[]) as Input;

    if (this.Validator) {
      const Validator = BaseValidator.resolveValidator(this.Validator);
      const Context = this.overrideContext(ctx);

      Output.push(Validator.toSample(Context).data);
    }

    return this.Sample ?? Output;
  }

  protected _toStatic(
    ctx?: IStaticContext<IArrayValidatorOptions>,
  ): ArrayValidator<Shape, Input, Output> {
    const Validator = BaseValidator.resolveValidator(this.Validator);
    const Context = this.overrideContext(ctx);

    return ArrayValidator.array(
      Validator.toStatic(Context) as Shape,
      ctx?.validatorOptions,
    );
  }

  protected async _cast(ctx: IValidatorContext<any, any>): Promise<void> {
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

    if (this._isPlainObject(ctx.output)) {
      try {
        const NanKeyErr = await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.nanKey,
          "A NaN key has been detected in the array!",
        );

        ctx.output = Object.keys(ctx.output).reduce((array, key) => {
          const Key = parseInt(key);

          if (isNaN(Key)) {
            if (ctx.validatorOptions?.pushNanKeys) {
              array.push(ctx.output[key]);

              return array;
            }

            if (ctx.validatorOptions?.ignoreNanKeys) return array;

            throw NanKeyErr;
          }

          array[Key] = ctx.output[key];

          return array;
        }, [] as any[]);

        return;
      } catch {
        // Do nothing...
      }
    }

    if (ctx.validatorOptions?.noCastSingularToArray) {
      throw await BaseValidator.resolveErrorMessage(
        ctx.validatorOptions?.messages?.typeError,
        "Invalid array has been provided!",
      );
    }

    ctx.output = [ctx.output];
  }

  constructor(
    validator?: Shape | (() => Shape),
    options?: IArrayValidatorOptions,
  ) {
    super(ValidatorType.NON_PRIMITIVE, "array", options);

    this.Validator = validator;

    this._custom(async (ctx) => {
      if (!(ctx.output instanceof Array)) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid array has been provided!",
        );
      }

      if (typeof ctx.validatorOptions?.minLength === "number") {
        if (ctx.output.length < ctx.validatorOptions.minLength) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.smallerLength,
            "Array is smaller than minimum length!",
          );
        }
      }

      if (typeof ctx.validatorOptions?.maxLength === "number") {
        if (ctx.output.length > ctx.validatorOptions.maxLength) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.greaterLength,
            "Array is greater than maximum length!",
          );
        }
      }

      if (ctx.output.length) {
        ctx.output = [...ctx.output];

        let Exception: ValidationException | undefined;

        if (this.Validator) {
          const Validator = BaseValidator.resolveValidator(this.Validator);
          const Context = this.overrideContext(ctx);

          for (const [Index, Input] of Object.entries(ctx.output)) {
            try {
              const Location = `${ctx.location}.${Index}`;

              const Key = parseInt(Index);

              ctx.output[Key] = await Validator.validate(Input, {
                ...Context,
                location: Location,
                index: Key,
                property: Index,
                parent: ctx,
                internal: true,
              });
            } catch (error) {
              if (!Exception) Exception = new ValidationException();

              Exception.pushIssues(error);
            }
          }
        }

        if (Exception?.issues.length) throw Exception;
      }
    }, true);
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
