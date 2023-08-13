// deno-lint-ignore-file no-explicit-any
import {
  TErrorMessage,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";

export interface IDateValidatorOptions extends IBaseValidatorOptions {
  messages?: Partial<
    Record<"typeError" | "smaller" | "greater", TErrorMessage>
  >;
}

export class DateValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IDateValidatorOptions;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "date",
      description: this.Description,
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return this.Sample ?? (new Date() as Input);
  }

  constructor(options: IDateValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      const Output = new Date(ctx.output);

      if (
        !ctx.output ||
        Output.toString() === "Invalid Date" ||
        isNaN(Output as any)
      )
        throw await this._resolveErrorMessage(
          this.Options?.messages?.typeError,
          "Value is not a valid date!"
        );

      return Output;
    });
  }

  public between(options: { start?: Date | number; end?: Date | number }) {
    const Validator = this.custom(async (ctx) => {
      const Input = Number(ctx.output);

      if (Input < Number(options.start || 0))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.smaller,
          "Date is smaller than minimum!"
        );

      if (Input > Number(options.end || Infinity))
        throw await this._resolveErrorMessage(
          this.Options?.messages?.greater,
          "Date is greater than maximum!"
        );
    });

    return Validator as DateValidator<
      Type,
      typeof Validator extends BaseValidator<any, infer I, any> ? I : Input,
      typeof Validator extends BaseValidator<any, any, infer O> ? O : Output
    >;
  }

  public start(at: Date | number) {
    return this.between({ start: at });
  }

  public end(at: Date | number) {
    return this.between({ end: at });
  }
}
