// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../exceptions.ts";

export interface IValidationContext {
  label?: string;
  input: any;
  location: string;
  shouldTerminate: () => void;
}

export type TCustomValidator<Input, Return> = (
  input: Input,
  ctx: IValidationContext
) => Return;

export type TCustomValidatorReturn<Return, Default> = Return extends void
  ? Default
  : Return extends Promise<infer R>
  ? TCustomValidatorReturn<R, Default>
  : Return;

export type inferInput<T> = T extends BaseValidator<any, infer Input, any>
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

export interface ValidatorJSONSchema {
  type: string | string[];
  description?: string;
  minLength?: number;
  maxLength?: number;
  minAmount?: number;
  maxAmount?: number;
  pattern?: string;
  choices?: string[];
  properties?: Record<string, ValidatorJSONSchema>;
  additionalProperties?: ValidatorJSONSchema;
  requiredProperties?: string[];
  tuple?: ValidatorJSONSchema[];
  items?: ValidatorJSONSchema;
  allOf?: ValidatorJSONSchema[];
  anyOf?: ValidatorJSONSchema[];
  expected?: any;
}

export interface JSONSchemaOptions {}

export interface JSONSchema {
  schema: ValidatorJSONSchema;
}

export class BaseValidator<_, __, Output> {
  protected Description?: string;

  protected Context: IValidationContext;
  protected ShouldTerminate = false;

  protected _toJSON(_options?: JSONSchemaOptions): ValidatorJSONSchema {
    throw new Error(`_toJSON implementation is required!`);
  }

  // deno-lint-ignore require-await
  protected async _validate(
    _input: unknown,
    _ctx: IValidationContext
  ): Promise<Output> {
    throw new Error(`Validator implementation is required!`);
  }

  constructor() {
    this.Context = {
      input: undefined,
      location: "input",
      shouldTerminate: () => {
        this.ShouldTerminate = true;
      },
    };
  }

  public async validate(
    input?: unknown,
    ctx?: Omit<Partial<IValidationContext>, "shouldTerminate">
  ): Promise<Output> {
    try {
      // Resolve Context
      this.Context = { ...this.Context, ...ctx };
      this.Context.input = this.Context.input ?? input;

      // Execute Validator
      return await this._validate(input, this.Context); // Await here to catch the error
    } catch (error) {
      const Exception = new ValidationException("Validation Error!");

      (error instanceof Array ? error : [error]).forEach((err) => {
        if (err instanceof ValidationException) {
          Exception.pushIssues(...err.issues);
        } else if (err instanceof Error) {
          Exception.pushIssues(
            ...(err instanceof ValidationException
              ? err.issues
              : [
                  {
                    message: err.message,
                    label: this.Context.label,
                    location: this.Context.location,
                    input,
                  },
                ])
          );
        } else if (typeof err === "string") {
          Exception.pushIssues({
            message: err,
            label: this.Context.label,
            location: this.Context.location,
            input,
          });
        }
      });

      throw Exception;
    }
  }

  public describe(description: string) {
    this.Description = description;
    return this;
  }

  public toJSON(options?: JSONSchemaOptions) {
    return {
      schema: this._toJSON(options),
    };
  }
}
