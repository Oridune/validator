// deno-lint-ignore-file no-explicit-any no-empty-interface
import { ValidationException } from "../exceptions.ts";

export interface IBaseValidatorOptions {
  throwsFatal?: boolean;
}

export interface IValidatorContext extends IValidationOptions {
  readonly input: any;
  output?: any;
  throwsFatal: () => void;
}

export interface IValidationOptions {
  name?: string;
  location?: string;
  index?: string | number | symbol;
  parent?: IValidatorContext;
}

export type TCustomValidator<_Input, Return> = (
  ctx: IValidatorContext
) => Return;

export type TCustomValidatorReturn<Return, Default> = Return extends void
  ? Default
  : Return extends Promise<infer R>
  ? TCustomValidatorReturn<R, Default>
  : Return;

export type inferInput<T> = T extends BaseValidator<infer Input, any, any>
  ? Input extends BaseValidator<any, any, any>
    ? inferInput<Input>
    : Input
  : never;

export type inferEachInput<T extends Array<any>> = {
  [K in keyof T]: inferInput<T[K]>;
};

export type inferOutput<T> = T extends BaseValidator<any, any, infer Output>
  ? Output extends BaseValidator<any, any, any>
    ? inferOutput<Output>
    : Output
  : never;

export type inferEachOutput<T extends Array<any>> = {
  [K in keyof T]: inferOutput<T[K]>;
};

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

export interface IJSONSchema {
  schema: IValidatorJSONSchema;
}

export class BaseValidator<Type, Input, Output> {
  protected Description?: string;
  protected Exception: ValidationException;
  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected _toJSON(_options?: IJSONSchemaOptions): IValidatorJSONSchema {
    throw new Error(`_toJSON implementation is required!`);
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

  public throwsFatal() {
    this.Exception.throwsFatal();
    return this;
  }

  public custom<Return>(
    validator: TCustomValidator<Output, Return>
  ): BaseValidator<Type, Input, TCustomValidatorReturn<Return, Output>> {
    if (typeof validator !== "function")
      throw new Error(`Invalid validator function has been provided!`);

    this.CustomValidators.push(validator);
    return this as any;
  }

  public async validate(
    input?: any,
    options?: IValidationOptions
  ): Promise<Output> {
    const Context: IValidatorContext = {
      input,
      name: options?.name,
      location: options?.location ?? options?.name ?? "input",
      index: options?.index,
      parent: options?.parent,
      throwsFatal: this.throwsFatal.bind(this),
    };

    this.Exception = this.Exception.clone().reset();
    await this._validate(Context);
    return Context.output;
  }

  public describe(description: string) {
    this.Description = description;
    return this;
  }

  public toJSON(options?: IJSONSchemaOptions) {
    return {
      schema: this._toJSON(options),
    };
  }
}
