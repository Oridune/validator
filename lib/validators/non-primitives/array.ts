// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import { TErrorMessage } from "../../types.ts";
import {
  ValidatorType,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface IArrayValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;

  /**
   * Requires `cast` to be `true`
   */
  splitter?: string | RegExp;

  /**
   * Requires `cast` to be `true`
   */
  ignoreNanKeys?: boolean;

  /**
   * Requires `cast` to be `true`
   */
  castObjectToArray?: boolean;

  /**
   * Requires `cast` to be `true`
   */
  noCastSingularToArray?: boolean;
  messages?: Partial<
    Record<"typeError" | "smallerLength" | "greaterLength", TErrorMessage>
  >;
}

export class ArrayValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IArrayValidatorOptions;
  protected Validator?: Type | (() => Type);

  protected MinLength?: number;
  protected MaxLength?: number;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    const Validator =
      this.Validator && BaseValidator.resolveValidator(this.Validator);

    return {
      type: "array",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      items: Validator?.["_toJSON"](),
    };
  }

  protected _toSample(options?: ISampleDataOptions) {
    const Output = [] as Input & Array<any>;

    if (this.Validator) {
      const Validator = BaseValidator.resolveValidator(this.Validator);

      for (let i = 0; i < (this.MinLength ?? 1); i++)
        Output.push(Validator["_toSample"](options));
    }

    return this.Sample ?? Output;
  }

  constructor(
    validator?: Type | (() => Type),
    options: IArrayValidatorOptions = {}
  ) {
    super(ValidatorType.NON_PRIMITIVE, options);

    this.Validator = validator;
    this.Options = options;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      cast: if (!(ctx.output instanceof Array)) {
        const Err = await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Invalid array has been provided!"
        );

        if (!this.Options?.cast) throw Err;

        if (typeof ctx.output === "string")
          try {
            return (ctx.output = JSON.parse(ctx.output));
          } catch {
            if (this.Options.splitter)
              return (ctx.output = ctx.output
                .toString()
                .split(this.Options.splitter));
          }

        if (ctx.output instanceof Array) break cast;

        if (
          typeof ctx.output === "object" &&
          ctx.output !== null &&
          ctx.output.constructor === Object
        ) {
          if (this.Options.castObjectToArray)
            return (ctx.output = Object.values(ctx.output));

          try {
            return (ctx.output = Object.keys(ctx.output).reduce(
              (array, key) => {
                const Key = parseInt(key);

                if (isNaN(Key)) {
                  if (this.Options.ignoreNanKeys) return array;

                  throw Err;
                }

                array[Key] = ctx.output[key];

                return array;
              },
              [] as any[]
            ));
          } catch {
            // Do nothing...
          }
        }

        if (this.Options.noCastSingularToArray) throw Err;

        ctx.output = [ctx.output];
      }

      ctx.output = [...ctx.output];

      const Exception = new ValidationException();

      if (this.Validator) {
        const Validator = BaseValidator.resolveValidator(this.Validator);

        for (const [Index, Input] of Object.entries(ctx.output))
          try {
            const Key = parseInt(Index);

            ctx.output[Key] = await Validator.validate(Input, {
              ...ctx,
              location: `${ctx.location}.${Index}`,
              index: Key,
              property: Index,
              parent: ctx,
            });
          } catch (error) {
            Exception.pushIssues(error);
          }
      }

      if (Exception.issues.length) throw Exception;
    });
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options =
      typeof options === "object" ? options : { min: options, max: options };
    this.MinLength = Options.min;
    this.MaxLength = Options.max;

    const Validator = this.custom(async (ctx) => {
      if (ctx.output?.length < (Options.min ?? 0))
        throw await this._resolveErrorMessage(
          this.Options.messages?.smallerLength,
          "Array is smaller than minimum length!"
        );

      if (ctx.output?.length > (Options.max ?? Infinity))
        throw await this._resolveErrorMessage(
          this.Options.messages?.greaterLength,
          "Array is greater than maximum length!"
        );
    });

    return Validator as ArrayValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }

  public min(length: number) {
    return this.length({ min: length });
  }

  public max(length: number) {
    return this.length({ max: length });
  }
}
