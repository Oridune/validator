// deno-lint-ignore-file no-async-promise-executor no-explicit-any
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
  TCustomValidator,
  TCustomValidatorReturn,
} from "./base.ts";

export type ArrayValidatorOptions = {
  casting?: boolean;
  splitter?: string | RegExp;
  messages?: {
    notArray?: string;
    smallerThanMinLength?: string;
    largerThanMaxLength?: string;
  };
  shouldTerminate?: boolean;
};

export class ArrayValidator<Validator, Input, Output> extends BaseValidator<
  Validator,
  Input,
  Output
> {
  protected Validator?: BaseValidator<any, any, any>;
  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected MinLength?: number;
  protected MaxLength?: number;

  protected _toJSON(_options?: JSONSchemaOptions) {
    return {
      type: "array",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      items: this.Validator?.["_toJSON"](),
    };
  }

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

    let Result: any = [];

    const ErrorList: ValidationException[] = [];

    if (this.Validator)
      for (const [Index, Input] of Object.entries(input)) {
        if (this.ShouldTerminate && ErrorList.length) break;

        this.ShouldTerminate = false;

        await this.Validator.validate(Input, {
          ...ctx,
          location: `${ctx.location}.${Index}`,
        })
          .then((result) => Result.push(result))
          .catch((err) => ErrorList.push(err));
      }
    else Result = input;

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
    validator?: Validator,
    protected Options?: ArrayValidatorOptions
  ) {
    super();

    if (validator)
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");
      else this.Validator = validator;
  }

  public custom<Return>(
    validator: TCustomValidator<Output, Return>
  ): ArrayValidator<Validator, Input, TCustomValidatorReturn<Return, Output>> {
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
