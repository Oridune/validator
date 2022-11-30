// deno-lint-ignore-file no-async-promise-executor no-explicit-any
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
  TCustomValidator,
  TCustomValidatorReturn,
} from "./base.ts";

export type StringValidatorOptions = {
  casting?: boolean;
  messages?: {
    notString?: string;
    notMatched?: string;
    smallerThanMinLength?: string;
    largerThanMaxLength?: string;
  };
  shouldTerminate?: boolean;
};

export class StringValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected MinLength?: number;
  protected MaxLength?: number;
  protected Pattern?: RegExp;

  protected _toJSON(_options?: JSONSchemaOptions) {
    return {
      type: "string",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      pattern: this.Pattern?.toString(),
    };
  }

  protected async _validate(
    input: unknown,
    ctx: IValidationContext
  ): Promise<Output> {
    if (this.Options?.shouldTerminate) ctx.shouldTerminate();

    if (this.Options?.casting) input = `${input}`;
    if (typeof input !== "string") {
      throw (
        this.Options?.messages?.notString ?? "Invalid string has been provided!"
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
          Result = ctx.output = res ?? Result;
        })
        .catch((err: any) => {
          ErrorList.push(err);
        });
    }

    if (ErrorList.length) throw ErrorList;

    return Result as Output;
  }

  constructor(protected Options?: StringValidatorOptions) {
    super();
  }

  public custom<Return>(
    validator: TCustomValidator<Output, Return>
  ): StringValidator<Type, Input, TCustomValidatorReturn<Return, Output>> {
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
          "String is smaller than minimum length!"
        );
      }

      if (Input.length > (options.max || Infinity)) {
        throw (
          this.Options?.messages?.smallerThanMinLength ??
          "String is larger than maximum length!"
        );
      }
    });
  }

  public matches(
    options: { regex: RegExp; shouldTerminate?: boolean } | RegExp
  ) {
    const Options = options instanceof RegExp ? { regex: options } : options;
    this.Pattern = Options.regex;

    return this.custom((input, ctx) => {
      const Input = `${input}`;

      if (Options.shouldTerminate) ctx.shouldTerminate();

      if (!Options.regex?.test(Input)) {
        throw (
          this.Options?.messages?.notMatched ??
          "String didn't match the required pattern!"
        );
      }
    });
  }
}
