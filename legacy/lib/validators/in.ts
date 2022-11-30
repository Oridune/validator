// deno-lint-ignore-file no-async-promise-executor no-explicit-any
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  IValidationContext,
  JSONSchemaOptions,
  TCustomValidator,
  TCustomValidatorReturn,
} from "./base.ts";

export type InValidatorOptions = {
  messages?: {
    notString?: string;
    notInList?: string;
  };
  shouldTerminate?: boolean;
};

export class InValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected _toJSON(_options?: JSONSchemaOptions) {
    if (!(this.List instanceof Array))
      return {
        type: "enum",
        description: this.Description,
      };

    const ChoiceTypes = Array.from(
      new Set(this.List.map((item) => typeof item))
    );

    return {
      type: ChoiceTypes.length
        ? ChoiceTypes.length === 1
          ? ChoiceTypes[0]
          : ChoiceTypes
        : "enum",
      description: this.Description,
      choices:
        this.List instanceof Array
          ? Array.from(new Set(this.List.map((item) => `${item}`)))
          : undefined,
    };
  }

  protected async _validate(
    input: unknown,
    ctx: IValidationContext
  ): Promise<Output> {
    if (this.Options?.shouldTerminate) ctx.shouldTerminate();

    let Result: any = input;

    if (
      !(
        typeof this.List === "function" ? await this.List(ctx) : this.List
      ).includes(Result)
    )
      throw this.Options?.messages?.notInList ?? "Value not in the list!";

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

  constructor(
    protected List:
      | Input[]
      | ((ctx: IValidationContext) => Input[] | Promise<Input[]>),
    protected Options?: InValidatorOptions
  ) {
    super();
  }

  public custom<Return>(
    validator: TCustomValidator<Output, Return>
  ): InValidator<Type, Input, TCustomValidatorReturn<Return, Output>> {
    this.CustomValidators.push(validator);
    return this as any;
  }
}
