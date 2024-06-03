// deno-lint-ignore-file no-explicit-any no-empty-interface
import type { TErrorMessage } from "../types.ts";
import { ValidationException } from "../../exceptions.ts";
import { ValidationDebugger } from "../../debugger.ts";

export enum ValidatorType {
  PRIMITIVE = "primitive",
  NON_PRIMITIVE = "non-primitive",
  UTILITY = "utility",
}

export interface ICastOptions {}

export interface IOptionalOptions {
  default?: any;
  validate?: boolean;
  nullish?: boolean;
  falsy?: boolean;
}

export type TBaseValidatorOptions = {
  cast?: boolean;
  castOptions?: ICastOptions;

  optional?: boolean;
  optionalOptions?: IOptionalOptions;

  description?: string;
  sample?: any;
  throwsFatal?: boolean;
} & Record<string, any>;

export type IValidationContext = {
  name?: string;
  location?: string;
  index?: string | number | symbol; //! Both index and property are the same!
  property?: string | number | symbol;
  parent?: IValidatorContext;
  context?: unknown;
  options?: TBaseValidatorOptions;
  deepOptions?: TBaseValidatorOptions;
} & Record<string, any>;

export interface IValidatorContext<
  Input = unknown,
  Output = unknown,
> extends Omit<IValidationContext, "options"> {
  validatorOptions?: TBaseValidatorOptions;
  readonly input: Input;
  output: Output;
  exception: ValidationException;
  throwsFatal: () => void;
  debugger?: ValidationDebugger;
}

export type TCustomValidator<Input, Output, Return> = (
  ctx: IValidatorContext<Input, Output>,
) => Return;

export type TCustomValidatorReturn<Return, Default> = Return extends void
  ? Default
  : Return extends Promise<infer R> ? TCustomValidatorReturn<R, Default>
  : Return;

export interface IValidatorJSONSchema {
  type: string | string[];
  description?: string;
  optional?: boolean;
  cast?: boolean;
  isUrl?: boolean;
  isInt?: boolean;
  isFloat?: boolean;
  isNaN?: boolean;
  minLength?: number;
  maxLength?: number;
  minAmount?: number;
  maxAmount?: number;
  choices?: string[];
  patterns?: string[];
  startsAt?: Date | number;
  endsAt?: Date | number;
  properties?: Record<string, IValidatorJSONSchema>;
  additionalProperties?: IValidatorJSONSchema;
  requiredProperties?: string[];
  tuple?: IValidatorJSONSchema[];
  items?: IValidatorJSONSchema;
  allOf?: IValidatorJSONSchema[];
  anyOf?: IValidatorJSONSchema[];
  expected?: any;
}

export interface IJSONSchemaOptions {
  options?: TBaseValidatorOptions;
  deepOptions?: TBaseValidatorOptions;
}

export interface IJSONSchemaContext<Opts = TBaseValidatorOptions>
  extends IJSONSchemaOptions {
  validatorOptions?: Opts;
}

export interface ISampleDataOptions {
  schema?: boolean;
  schemaOptions?: IJSONSchemaOptions;
  options?: TBaseValidatorOptions;
  deepOptions?: TBaseValidatorOptions;
}

export interface ISampleDataContext<Opts = TBaseValidatorOptions>
  extends ISampleDataOptions {
  validatorOptions?: Opts;
}

export interface IStaticOptions {
  options?: TBaseValidatorOptions;
  deepOptions?: TBaseValidatorOptions;
}

export interface IStaticContext<Opts = TBaseValidatorOptions>
  extends IJSONSchemaOptions {
  validatorOptions?: Opts;
}

export interface IJSONSchema {
  schema: IValidatorJSONSchema;
}

export class BaseValidator<
  Shape = any,
  Input = any,
  Output = any,
> {
  static createFactory<T, A extends unknown[]>(
    cls: new (...args: A) => T,
  ): (...args: A) => T {
    return (...args: A) => new cls(...args);
  }

  static resolveValidator<V extends BaseValidator<any, any, any>>(
    validator: any,
  ): V {
    const Validator = typeof validator === "function" ? validator() : validator;

    if (!(Validator instanceof BaseValidator)) {
      throw new Error(`Invalid validator provided!`);
    }

    return Validator as V;
  }

  protected Input?: Input;
  protected Output?: Output;

  //! If any new class properties are created, remember to add them to the .clone() method!
  protected Description?: string;
  protected Sample?: any;
  protected CustomValidators: TCustomValidator<
    unknown,
    unknown,
    unknown
  >[] = [];

  protected async _resolveErrorMessage(
    message: TErrorMessage | undefined,
    defaultMessage: string,
  ) {
    return typeof message === "function"
      ? await message()
      : typeof message === "string"
      ? message
      : defaultMessage;
  }

  protected _toJSON(_ctx?: IJSONSchemaContext): IValidatorJSONSchema {
    throw new Error(`_toJSON implementation is required!`);
  }

  protected _toSample(_ctx?: ISampleDataContext): Input {
    throw new Error(`_toSample implementation is required!`);
  }

  protected _cast(
    _ctx: IValidatorContext<unknown, unknown>,
  ): Promise<void> | void {
    // Implement casting logic...

    return Promise.resolve();
  }

  protected _custom<Return>(
    validator: TCustomValidator<any, any, Return>,
  ) {
    if (
      this.Type === ValidatorType.UTILITY &&
      !["and", "or", "if"].includes(this.ID)
    ) {
      this.CustomValidators.push(validator);
    } else {
      this.CustomValidators.push(
        async (ctx: IValidatorContext<any, any>) => {
          optional: if (ctx.validatorOptions?.optional ?? false) {
            const OptionalOptions = ctx.validatorOptions?.optionalOptions;

            if (
              (OptionalOptions?.nullish &&
                ([null, undefined] as any).includes(ctx.output)) ||
              (OptionalOptions?.falsy && !ctx.output)
            ) ctx.output = undefined;

            if (ctx.output !== undefined) break optional;

            ctx.output = typeof OptionalOptions?.default === "function"
              ? await OptionalOptions?.default(ctx)
              : OptionalOptions?.default;

            if (OptionalOptions?.validate !== true) return ctx.output;
          }

          if (ctx.validatorOptions?.cast) await this._cast(ctx);

          return await validator(ctx);
        },
      );
    }

    return this as unknown as BaseValidator<
      Shape,
      Input,
      TCustomValidatorReturn<Return, Output>
    >;
  }

  protected async _validate(
    ctx: IValidatorContext,
  ): Promise<IValidatorContext> {
    for (const Validator of this.CustomValidators) {
      try {
        ctx.output = (await Validator(ctx)) ?? ctx.output;
      } catch (error) {
        const ResolvedError = error instanceof ValidationException ? error : {
          message: error.message ?? error,
          name: ctx.name,
          location: ctx.location,
          input: ctx.input,
          output: ctx.output,
          stack: error.stack,
        };

        ctx.exception.pushIssues(ResolvedError);
      }
    }

    if (ctx.exception.issues.length) throw ctx.exception;

    return ctx;
  }

  protected _toStatic(
    _ctx?: IStaticContext,
  ): BaseValidator<Shape, Input, Output> {
    return this;
  }

  constructor(
    public Type: ValidatorType,
    public ID: string,
    private ValidatorOptions: TBaseValidatorOptions = {},
  ) {
    this.Description = ValidatorOptions.description;
    this.Sample = ValidatorOptions.sample;
  }

  /**
   * The function `getOptions` returns the `ValidatorOptions` property.
   * @returns The `ValidatorOptions` property is being returned.
   */
  public getOptions() {
    return this.ValidatorOptions;
  }

  /**
   * Adds a stop point to the validation if there was an error occured on the current validator.
   */
  public throwsFatal() {
    this.ValidatorOptions.throwsFatal = true;
    return this;
  }

  /**
   * Adds a stop point to the validation if there was an error occured on the current validator.
   */
  public checkpoint() {
    return this.throwsFatal();
  }

  /**
   * Provide a custom method for validation.
   * @param validator A validation function.
   * @returns
   */
  public custom<Return>(
    validator: TCustomValidator<Input, Output, Return>,
  ) {
    if (typeof validator !== "function") {
      throw new Error(`Invalid validator function has been provided!`);
    }

    return this._custom(validator);
  }

  /**
   * Executes the validation chain.
   * @param input An input value to be validated.
   * @param options Validation Options
   * @returns
   *
   * @throws {ValidationException}
   */
  public async validate(
    input?: any,
    ctx?: IValidationContext,
  ): Promise<Output> {
    let ValidatorOptions = this.ValidatorOptions;

    if (ctx?.options || ctx?.deepOptions) {
      ValidatorOptions = {
        ...ctx?.deepOptions,
        ...ctx?.options,
        ...this.ValidatorOptions,
      };
    }

    const VE = new ValidationException();

    if (ValidatorOptions.throwsFatal) VE.throwsFatal();

    const DefaultName = "input";
    const Context: IValidatorContext<Input, Output> = {
      exception: VE,
      throwsFatal: () => VE.throwsFatal(),
      name: ctx?.name ?? DefaultName,
      index: ctx?.index,
      property: ctx?.property,
      parent: ctx?.parent,
      context: ctx?.context,
      input,
      output: input,
      location: ctx?.location ?? ctx?.name ?? DefaultName,
      validatorOptions: ValidatorOptions,
      deepOptions: ctx?.deepOptions,
    };

    if (ValidationDebugger.enabled) {
      Context.debugger = ctx?.debugger ??
        new ValidationDebugger(ctx?.name);

      let Error: ValidationException | undefined;

      try {
        Context.debugger?.entry({
          label: this.constructor.name,
          tags: [Context.location, Context.output],
          config: ValidatorOptions,
        });

        await this._validate(Context);
      } catch (error) {
        Error = error;
        throw Error;
      } finally {
        Context.debugger?.exit({
          label: this.constructor.name,
          output: Context.output,
          thrown: Error,
        }).log();
      }
    } else await this._validate(Context);

    return Context.output;
  }

  /**
   * Generates a JSON schema based on your validation schema.
   * @param options
   * @returns
   */
  public toJSON(options?: IJSONSchemaOptions) {
    const ValidatorOptions = {
      ...options?.deepOptions,
      ...options?.options,
      ...this.ValidatorOptions,
    };

    delete options?.options;

    const Context: IJSONSchemaContext = {
      ...options,
      validatorOptions: ValidatorOptions,
    };

    return {
      schema: this._toJSON(Context),
    };
  }

  /**
   * Generates a Sample data based on your validation schema.
   * @param options
   * @returns
   */
  public toSample(options?: ISampleDataOptions) {
    const Schema = options?.schema !== false
      ? this.toJSON({
        options: options?.options,
        deepOptions: options?.deepOptions,
        ...options?.schemaOptions,
      }).schema
      : undefined;

    const ValidatorOptions = {
      ...options?.deepOptions,
      ...options?.options,
      ...this.ValidatorOptions,
    };

    delete options?.options;

    const Context: IJSONSchemaContext = {
      ...options,
      validatorOptions: ValidatorOptions,
    };

    return {
      data: this._toSample(Context),
      schema: Schema,
    };
  }

  /**
   * Converts the runtime context into a static validator.
   * @param options
   * @returns
   */
  public toStatic(options?: IStaticOptions) {
    const ValidatorOptions = {
      ...options?.deepOptions,
      ...options?.options,
      ...this.ValidatorOptions,
    };

    delete options?.options;

    const Context: IStaticContext = {
      ...options,
      validatorOptions: ValidatorOptions,
    };

    return this._toStatic(Context);
  }

  /**
   * Add a description for the JSON schema.
   * @param description
   * @returns
   */
  public describe(description: string) {
    this.Description = this.ValidatorOptions.description = description;
    return this;
  }

  /**
   * Add a sample for the Sample data.
   * @param sample
   * @returns
   */
  public sample(sample: any) {
    this.Sample = this.ValidatorOptions.sample = sample;
    return this;
  }

  /**
   * Tries to execute the validation chain and if there is an error, it will not be thrown but instead will be returned.
   * @param input An input value to be validated.
   * @param ctx
   * @returns
   */
  public async try(input?: any, ctx?: IValidationContext) {
    try {
      return { output: await this.validate(input, ctx), error: null };
    } catch (error) {
      return { output: null, error };
    }
  }

  /**
   * Tries to execute the validation chain and returns a boolean value based on the result.
   * @param input An input value to be validated.
   * @param ctx
   * @returns
   */
  public async test(input?: any, ctx?: IValidationContext) {
    const { error } = await this.try(input, ctx);
    return !error;
  }
}
