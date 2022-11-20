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

export class BaseValidator<_, __, Output> {
  protected Context: IValidationContext;
  protected ShouldTerminate = false;

  // deno-lint-ignore require-await
  protected async _validate(
    _: unknown,
    __: IValidationContext
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
    input: unknown,
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
        if (err instanceof ValidationException)
          Exception.pushIssues(...err.issues);
        else if (err instanceof Error)
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
        else if (typeof err === "string")
          Exception.pushIssues({
            message: err,
            label: this.Context.label,
            location: this.Context.location,
            input,
          });
      });

      throw Exception;
    }
  }
}
