// deno-lint-ignore-file no-async-promise-executor no-explicit-any
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  inferInput,
  inferOutput,
  IValidationContext,
  JSONSchemaOptions,
  TCustomValidator,
  TCustomValidatorReturn,
} from "./base.ts";

export type TupleValidatorOptions = {
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
  protected Validators: BaseValidator<any, any, any>[] = [];
  protected RestValidator?: BaseValidator<any, any, any>;

  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected MinLength = 0;
  protected MaxLength = 0;

  protected _toJSON(_options?: JSONSchemaOptions) {
    return {
      type: "array",
      description: this.Description,
      minLength: this.MinLength,
      maxLength: this.MaxLength,
      tuple: this.Validators.map((validator) => validator["_toJSON"]()),
      items: this.RestValidator?.["_toJSON"](),
    };
  }

  protected async _validate(
    input: any[],
    ctx: IValidationContext
  ): Promise<Output> {
    if (this.Options?.shouldTerminate) ctx.shouldTerminate();

    if (this.Options?.casting && typeof input === "string") {
      try {
        input = JSON.parse(input);
      } catch {
        if (this.Options.splitter) {
          input = input.toString().split(this.Options.splitter);
        }
      }
    }

    if (!(input instanceof Array)) {
      throw (
        this.Options?.messages?.notArray ?? "Invalid array has been provided!"
      );
    }

    if (input.length < this.Validators.length) {
      throw (
        this.Options?.messages?.smallerThanMinLength ??
        "Array is smaller than minimum length!"
      );
    }

    if (!(this.RestValidator instanceof BaseValidator)) {
      if (input.length > this.Validators.length) {
        throw (
          this.Options?.messages?.smallerThanMinLength ??
          "Array is larger than maximum length!"
        );
      }
    }

    let Result: any = [];

    const ErrorList: ValidationException[] = [];

    for (const [Index, Input] of Object.entries(input)) {
      if (this.ShouldTerminate && ErrorList.length) break;

      this.ShouldTerminate = false;

      const Validator = this.Validators[parseInt(Index)] ?? this.RestValidator;

      if (Validator instanceof BaseValidator) {
        await Validator.validate(Input, {
          ...ctx,
          location: `${ctx.location}.${Index}`,
        })
          .then((result) => {
            if (ctx.output === undefined) ctx.output = [];
            ctx.output.push(result);
            Result.push(result);
          })
          .catch((err) => ErrorList.push(err));
      } else {
        if (ctx.output === undefined) ctx.output = [];
        ctx.output.push(Input);
        Result.push(Input);
      }
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
          Result = ctx.output = res ?? Result;
        })
        .catch((err: any) => {
          ErrorList.push(err);
        });
    }

    if (ErrorList.length) throw ErrorList;

    return Result as Output;
  }

  constructor(
    validators: Validator[],
    protected Options: TupleValidatorOptions
  ) {
    super();

    if (!(validators instanceof Array))
      throw new Error("Invalid validators list has been provided!");

    validators.forEach((validator) => {
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");

      this.MinLength += 1;
      this.MaxLength += 1;

      this.Validators.push(validator);
    });
  }

  public rest<
    RestValidator,
    T extends Array<any> = [...Validator, ...RestValidator[]]
  >(
    validator: RestValidator
  ): TupleValidator<T, inferInput<T>, inferOutput<T>> {
    if (this.RestValidator instanceof BaseValidator) {
      throw new Error("A rest validator cannot follow another rest validator.");
    }

    if (!(validator instanceof BaseValidator)) {
      throw new Error("Invalid validator instance has been provided!");
    }

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
    if ((options.min ?? this.MinLength) < this.MinLength)
      throw new Error(
        `Minimum length cannot be smaller than the defined tuple schema length!`
      );

    if ((options.max ?? this.MaxLength) < this.MaxLength)
      throw new Error(
        `Maximum length cannot be smaller than the defined tuple schema length!`
      );

    if ((options.min ?? this.MinLength) > this.MinLength && !this.RestValidator)
      throw new Error(
        `If you want to set a greater min length, please set a rest validator on the tuple!`
      );

    if ((options.max ?? this.MaxLength) > this.MaxLength && !this.RestValidator)
      throw new Error(
        `If you want to set a greater max length, please set a rest validator on the tuple!`
      );

    this.MinLength = options.min ?? this.MinLength;
    this.MaxLength = options.max ?? this.MaxLength;

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
