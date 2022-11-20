// deno-lint-ignore-file no-explicit-any no-async-promise-executor
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  IValidationContext,
  TCustomValidator,
  TCustomValidatorReturn,
} from "./base.ts";

export type BooleanValidatorOptions = {
  description?: string;
  expected?: boolean;
  casting?: boolean;
  messages?: {
    notBoolean?: string;
    notTrue?: string;
    notFalse?: string;
  };
  shouldTerminate?: boolean;
};

export class BooleanValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected async _validate(
    input: unknown,
    ctx: IValidationContext
  ): Promise<Output> {
    if (this.Options?.shouldTerminate) ctx.shouldTerminate();

    if (this.Options?.casting && typeof input === "string")
      input = ["true", "1"].includes(input.toLowerCase());

    if (typeof input !== "boolean")
      throw (
        this.Options?.messages?.notBoolean ??
        "Invalid boolean has been provided!"
      );

    let Result: any = input;

    if (
      typeof this.Options?.expected === "boolean" &&
      this.Options?.expected !== Result
    )
      throw this.Options?.expected
        ? this.Options?.messages?.notTrue ?? "Value should be true!"
        : this.Options?.messages?.notFalse ?? "Value should be false!";

    const ErrorList: ValidationException[] = [];

    for (const Validator of this.CustomValidators) {
      if (this.ShouldTerminate && ErrorList.length) break;

      this.ShouldTerminate = false;

      // Wrapping Validator in a new Promise because Validator will not always be a promise function!
      await new Promise(async (res, rej) => {
        try {
          res(
            await Validator(Result, {
              ...ctx,
              shouldTerminate: () => {
                this.ShouldTerminate = true;
                ctx.shouldTerminate();
              },
              location: ctx.location,
            })
          );
        } catch (err) {
          rej(err);
        }
      })
        .then((res: any) => {
          Result = res ?? Result;
        })
        .catch((err: any) => {
          ErrorList.push(err);
        });
    }

    if (ErrorList.length) throw ErrorList;

    return Result as Output;
  }

  constructor(protected Options?: BooleanValidatorOptions) {
    super();
  }

  public custom<Return>(
    validator: TCustomValidator<Output, Return>
  ): BooleanValidator<Type, Input, TCustomValidatorReturn<Return, Output>> {
    this.CustomValidators.push(validator);
    return this as any;
  }
}
