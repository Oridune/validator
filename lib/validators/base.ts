// deno-lint-ignore-file no-explicit-any no-empty-interface
import { ValidationException } from "../exceptions.ts";
import { TErrorMessage } from "../types.ts";

export interface IValidatorContext extends IValidationOptions {
  readonly input: any;
  output?: any;
  throwsFatal: () => void;
}

export interface IValidationOptions {
  name?: string;
  location?: string;
  index?: string | number | symbol; //! Both index and property are the same!
  property?: string | number | symbol;
  parent?: IValidatorContext;
  context?: any;
}

export type TCustomValidator<_Input, Return> = (
  ctx: IValidatorContext
) => Return;

export type TCustomValidatorReturn<Return, Default> = Return extends void
  ? Default
  : Return extends Promise<infer R>
  ? TCustomValidatorReturn<R, Default>
  : Return;

export interface IValidatorJSONSchema {
  type: string | string[];
  description?: string;
  minLength?: number;
  maxLength?: number;
  minAmount?: number;
  maxAmount?: number;
  pattern?: string;
  choices?: string[];
  properties?: Record<string, IValidatorJSONSchema>;
  additionalProperties?: IValidatorJSONSchema;
  requiredProperties?: string[];
  tuple?: IValidatorJSONSchema[];
  items?: IValidatorJSONSchema;
  allOf?: IValidatorJSONSchema[];
  anyOf?: IValidatorJSONSchema[];
  expected?: any;
}

export interface IJSONSchemaOptions {}

export interface ISampleDataOptions {
  schema?: boolean;
  schemaOptions?: IJSONSchemaOptions;
}

export interface IJSONSchema {
  schema: IValidatorJSONSchema;
}

export interface IBaseValidatorOptions {
  throwsFatal?: boolean;
}

export class BaseValidator<Type, Input, Output> {
  protected Exception: ValidationException;

  //! If any new class properties are created, remember to add them to the .clone() method!
  protected Description?: string;
  protected Sample?: any;
  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected async _resolveErrorMessage(
    message: TErrorMessage | undefined,
    defaultMessage: string
  ) {
    return typeof message === "function"
      ? await message()
      : typeof message === "string"
      ? message
      : defaultMessage;
  }

  protected _toJSON(_options?: IJSONSchemaOptions): IValidatorJSONSchema {
    throw new Error(`_toJSON implementation is required!`);
  }

  protected _toSample(_options?: ISampleDataOptions): Input {
    throw new Error(`_toSample implementation is required!`);
  }

  protected async _validate(
    ctx: IValidatorContext
  ): Promise<IValidatorContext> {
    for (const Validator of this.CustomValidators)
      try {
        ctx.output = (await Validator(ctx)) ?? ctx.output;
      } catch (error) {
        const ResolvedError =
          error instanceof ValidationException
            ? error
            : {
                message: error.message ?? error,
                name: ctx.name,
                location: ctx.location,
                input: ctx.input,
                output: ctx.output,
              };

        this.Exception.pushIssues(ResolvedError);
      }

    if (this.Exception.issues.length) throw this.Exception;

    return ctx;
  }

  constructor(options: IBaseValidatorOptions) {
    this.Exception = new ValidationException();
    if (options.throwsFatal) this.throwsFatal();
  }

  /**
   * Adds a stop point to the validation if there was an error occured on the current validator.
   *
   */
  public throwsFatal() {
    this.Exception.throwsFatal();
    return this;
  }

  /**
   * Adds a stop point to the validation if there was an error occured on the current validator.
   *
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
    validator: TCustomValidator<Output, Return>
  ): BaseValidator<Type, Input, TCustomValidatorReturn<Return, Output>> {
    if (typeof validator !== "function")
      throw new Error(`Invalid validator function has been provided!`);

    this.CustomValidators.push(validator);
    return this as any;
  }

  /**
   * Executes the validation chain.
   * @param input An input value to be validated.
   * @param options
   * @returns
   *
   * @throws {ValidationException}
   */
  public async validate(
    input?: any,
    options?: IValidationOptions
  ): Promise<Output> {
    const Context: IValidatorContext = {
      input,
      name: options?.name,
      location: options?.location ?? options?.name ?? "input",
      index: options?.index,
      property: options?.property,
      parent: options?.parent,
      context: options?.context,
      throwsFatal: this.throwsFatal.bind(this),
    };

    this.Exception = this.Exception.clone().reset();
    await this._validate(Context);
    return Context.output;
  }

  /**
   * Tries to execute the validation chain and if there is an error, it will not be thrown but instead will be returned.
   * @param input An input value to be validated.
   * @param options
   * @returns
   */
  public async try(input?: any, options?: IValidationOptions) {
    try {
      return { output: await this.validate(input, options), error: null };
    } catch (error) {
      return { output: null, error };
    }
  }

  /**
   * Tries to execute the validation chain and returns a boolean value based on the result.
   * @param input An input value to be validated.
   * @param options
   * @returns
   */
  public async test(input?: any, options?: IValidationOptions) {
    const { error } = await this.try(input, options);
    return !!error;
  }

  /**
   * Generates a JSON schema based on your validation schema.
   * @param options
   * @returns
   */
  public toJSON(options?: IJSONSchemaOptions) {
    return {
      schema: this._toJSON(options),
    };
  }

  /**
   * Generates a Sample data based on your validation schema.
   * @param options
   * @returns
   */
  public toSample(options?: ISampleDataOptions) {
    return {
      data: this._toSample(options),
      schema:
        options?.schema !== false
          ? this._toJSON(options?.schemaOptions)
          : undefined,
    };
  }

  /**
   * Add a description for the JSON schema.
   * @param description
   * @returns
   */
  public describe(description: string) {
    this.Description = description;
    return this;
  }

  /**
   * Add a sample for the Sample data.
   * @param sample
   * @returns
   */
  public sample(sample: any) {
    this.Sample = sample;
    return this;
  }
}
