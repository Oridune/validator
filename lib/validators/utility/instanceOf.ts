// deno-lint-ignore-file no-explicit-any
import { TErrorMessage } from "../../types.ts";
import {
  ValidatorType,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface IInstanceOfValidatorOptions<
  AllowUndefined extends boolean,
  Input,
  RestArgs extends Array<any>,
  Args = [Input, ...RestArgs][number]
> extends IBaseValidatorOptions {
  messages?: Partial<Record<"typeError", TErrorMessage>>;

  /**
   * If passed `true` than the validator will act as an optional validator with the default value as the instance of the class passed.
   */
  allowUndefined?: AllowUndefined;

  /**
   * If passed `true` than the validator will try to instantiate the class with the input value.
   */
  instantiate?: boolean;

  /**
   * If `instantiate` is set to `true`, the validator try to instantiate the class with the input value in the first argument, You can pass the rest of the arguments here if any.
   */
  instantiationArgs?: Args[] | ((value: Input) => Args[] | Promise<Args[]>);

  /**
   * If `instantiate` is set to `true`, the validator try to instantiate the class with the input value in the first argument, You can pass the rest of the arguments here if any.
   */
  instantiationRestArgs?:
    | RestArgs
    | ((value: Input) => RestArgs | Promise<RestArgs>);
}

export class InstanceOfValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: typeof (this.Sample ?? {}),
      description: this.Description,
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return this.Sample ?? ({} as Input);
  }

  constructor(
    protected Constructor: any,
    protected Options: IInstanceOfValidatorOptions<boolean, any, any> = {}
  ) {
    super(ValidatorType.UTILITY, Options);

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (!(ctx.output instanceof this.Constructor))
        try {
          if (
            !this.Options.instantiate ||
            (!this.Options.allowUndefined && ctx.output === undefined)
          )
            throw "";

          const Args =
            typeof this.Options.instantiationArgs === "function"
              ? await this.Options.instantiationArgs(ctx.output)
              : this.Options.instantiationArgs instanceof Array
              ? this.Options.instantiationArgs
              : [
                  ctx.output,
                  ...(typeof this.Options.instantiationRestArgs === "function"
                    ? await this.Options.instantiationRestArgs(ctx.output)
                    : this.Options.instantiationRestArgs ?? []),
                ];

          return new this.Constructor(...Args);
        } catch {
          throw await this._resolveErrorMessage(
            this.Options?.messages?.typeError,
            `Value is not an instanceOf ${this.Constructor.name}!`
          );
        }
    });
  }
}
