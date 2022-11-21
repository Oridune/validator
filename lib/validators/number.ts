// deno-lint-ignore-file no-async-promise-executor no-explicit-any
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
  TCustomValidator,
  TCustomValidatorReturn,
} from "./base.ts";

export type NumberValidatorOptions = {
  casting?: boolean;
  messages?: {
    notNumber?: string;
    smallerThanMinLength?: string;
    largerThanMaxLength?: string;
    smallerThanMinAmount?: string;
    largerThanMaxAmount?: string;
  };
  shouldTerminate?: boolean;
};

export class NumberValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected MinLength?: number;
  protected MaxLength?: number;
  protected MinAmount?: number;
  protected MaxAmount?: number;

  protected _toJSON(_options?: JSONSchemaOptions) {
    return {
      type: "number",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      minAmount: this.MinAmount,
      maxAmount: this.MaxAmount,
    };
  }

  protected async _validate(
    input: unknown,
    ctx: IValidationContext
  ): Promise<Output> {
    if (this.Options?.shouldTerminate) ctx.shouldTerminate();

    if (this.Options?.casting && !isNaN(input as any)) {
      input = parseFloat(input as any);
    }

    if (typeof input !== "number") {
      throw (
        this.Options?.messages?.notNumber || "Invalid number has been provided!"
      );
    }

    let Result: any = input;

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

  constructor(protected Options?: NumberValidatorOptions) {
    super();
  }

  public custom<Return>(
    validator: TCustomValidator<Output, Return>
  ): NumberValidator<Type, Input, TCustomValidatorReturn<Return, Output>> {
    this.CustomValidators.push(validator);
    return this as any;
  }

  public length(options: {
    min?: number;
    max?: number;
    shouldTerminate?: boolean;
  }) {
    this.MinLength = options.min;
    this.MaxLength = options.max;

    return this.custom((input, ctx) => {
      const Input = `${input}`;

      if (options.shouldTerminate) ctx.shouldTerminate();

      if (Input.length < (options.min || 0)) {
        throw (
          this.Options?.messages?.smallerThanMinLength ??
          "Number is smaller than minimum length!"
        );
      }

      if (Input.length > (options.max || Infinity)) {
        throw (
          this.Options?.messages?.smallerThanMinLength ??
          "Number is larger than maximum length!"
        );
      }
    });
  }

  public amount(options: {
    min?: number;
    max?: number;
    shouldTerminate?: boolean;
  }) {
    this.MinAmount = options.min;
    this.MaxAmount = options.max;

    return this.custom((input, ctx) => {
      const Input: number = parseFloat(`${input}`);

      if (options.shouldTerminate) ctx.shouldTerminate();

      if (Input < (options.min || 0)) {
        throw (
          this.Options?.messages?.smallerThanMinAmount ??
          "Number is smaller than minimum amount!"
        );
      }

      if (Input > (options.max || Infinity)) {
        throw (
          this.Options?.messages?.smallerThanMinAmount ??
          "Number is larger than maximum amount!"
        );
      }
    });
  }
}
