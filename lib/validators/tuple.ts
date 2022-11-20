// deno-lint-ignore-file no-async-promise-executor no-explicit-any
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  inferInput,
  inferOutput,
  IValidationContext,
  TCustomValidator,
  TCustomValidatorReturn,
} from "./base.ts";

export type TupleValidatorOptions = {
  description?: string;
  casting?: boolean;
  splitter?: string | RegExp;
  messages?: {
    notArray?: string;
    smallerThanMinLength?: string;
    largerThanMaxLength?: string;
  };
  shouldTerminate?: boolean;
};

export class TupleValidator<
  Validator extends Array<any>,
  Input,
  Output
> extends BaseValidator<Validator, Input, Output> {
  protected RestValidator?: BaseValidator<any, any, any>;
  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected async _validate(
    input: any[],
    ctx: IValidationContext
  ): Promise<Output> {
    if (this.Options?.shouldTerminate) ctx.shouldTerminate();

    if (this.Options?.casting && typeof input === "string")
      try {
        input = JSON.parse(input);
      } catch {
        if (this.Options.splitter)
          input = input.toString().split(this.Options.splitter);
      }

    if (!(input instanceof Array))
      throw (
        this.Options?.messages?.notArray ?? "Invalid array has been provided!"
      );

    if (input.length < this.Validators.length)
      throw (
        this.Options?.messages?.smallerThanMinLength ??
        "Array is smaller than minimum length!"
      );

    if (!(this.RestValidator instanceof BaseValidator))
      if (input.length > this.Validators.length)
        throw (
          this.Options?.messages?.smallerThanMinLength ??
          "Array is larger than maximum length!"
        );

    let Result: any = [];

    const ErrorList: ValidationException[] = [];

    for (const [Index, Input] of Object.entries(input)) {
      if (this.ShouldTerminate && ErrorList.length) break;

      this.ShouldTerminate = false;

      const Validator = this.Validators[parseInt(Index)] ?? this.RestValidator;

      if (Validator instanceof BaseValidator)
        await Validator.validate(Input, {
          ...ctx,
          location: `${ctx.location}.${Index}`,
        })
          .then((result) => Result.push(result))
          .catch((err) => ErrorList.push(err));
      else Result.push(Input);
    }

    if (ErrorList.length) throw ErrorList;

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

  constructor(
    protected Validators: Validator[],
    protected Options: TupleValidatorOptions
  ) {
    super();

    if (!(this.Validators instanceof Array))
      throw new Error("Invalid validators list has been provided!");

    this.Validators.forEach((validator) => {
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");
    });
  }

  public rest<
    RestValidator,
    T extends Array<any> = [...Validator, ...RestValidator[]]
  >(
    validator: RestValidator
  ): TupleValidator<T, inferInput<T>, inferOutput<T>> {
    if (this.RestValidator instanceof BaseValidator)
      throw new Error("A rest validator cannot follow another rest validator.");

    if (!(validator instanceof BaseValidator))
      throw new Error("Invalid validator instance has been provided!");

    this.RestValidator = validator;
    return this as any;
  }

  public custom<Return>(
    validator: TCustomValidator<Output, Return>
  ): TupleValidator<Validator, Input, TCustomValidatorReturn<Return, Output>> {
    this.CustomValidators.push(validator);
    return this as any;
  }

  public length(options: {
    min?: number;
    max?: number;
    shouldTerminate?: boolean;
  }) {
    return this.custom((input, ctx) => {
      if (!(input instanceof Array))
        throw (
          this.Options?.messages?.notArray ?? "Invalid array has been provided!"
        );

      const Input: Array<any> = input;

      if (options.shouldTerminate) ctx.shouldTerminate();

      if (Input.length < (options.min || 0))
        throw (
          this.Options?.messages?.smallerThanMinLength ??
          "Array is smaller than minimum length!"
        );

      if (Input.length > (options.max || Infinity))
        throw (
          this.Options?.messages?.smallerThanMinLength ??
          "Array is larger than maximum length!"
        );
    });
  }
}
