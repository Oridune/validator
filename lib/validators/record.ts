// deno-lint-ignore-file no-explicit-any no-async-promise-executor
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
  TCustomValidator,
  TCustomValidatorReturn,
} from "./base.ts";

export type RecordValidatorOptions = {
  casting?: boolean;
  messages?: {
    notObject?: string;
  };
  shouldTerminate?: boolean;
};

export class RecordValidator<Validator, Input, Output> extends BaseValidator<
  Validator,
  Input,
  Output
> {
  protected Validator?: BaseValidator<any, any, any>;
  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected _toJSON(_options?: JSONSchemaOptions) {
    return {
      type: "object",
      description: this.Description,
      additionalProperties: this.Validator?.["_toJSON"](),
    };
  }

  protected async _validate(
    input: Record<string, any>,
    ctx: IValidationContext
  ): Promise<Output> {
    if (this.Options?.shouldTerminate) ctx.shouldTerminate();

    if (this.Options?.casting && typeof input === "string") {
      try {
        input = JSON.parse(input);
      } catch {
        // Do nothing...
      }
    }

    if (typeof input !== "object") {
      throw (
        this.Options?.messages?.notObject ?? "Invalid object has been provided!"
      );
    }

    let Result: Record<string, any> = {};

    const ErrorList: ValidationException[] = [];

    if (this.Validator) {
      for (const [Index, Input] of Object.entries(input)) {
        if (this.ShouldTerminate && ErrorList.length) break;

        this.ShouldTerminate = false;

        await this.Validator.validate(Input, {
          ...ctx,
          location: `${ctx.location}.${Index}`,
        })
          .then((result) => (Result[Index] = result))
          .catch((err) => ErrorList.push(err));
      }
    } else Result = input;

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
    protected Options?: RecordValidatorOptions
  ) {
    super();

    if (validator)
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");
      else this.Validator = validator;
  }

  public custom<Return>(
    validator: TCustomValidator<Output, Return>
  ): RecordValidator<Validator, Input, TCustomValidatorReturn<Return, Output>> {
    this.CustomValidators.push(validator);
    return this as any;
  }
}
