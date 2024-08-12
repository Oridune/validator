// deno-lint-ignore-file no-explicit-any
import type { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export interface IDateValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<
    Record<"typeError" | "smaller" | "greater", TErrorMessage>
  >;

  /**
   * Provide a start time for validation (Use .start or .between methods)
   */
  startsAt?: Date | number;

  /**
   * Provide an ending time for validation (Use .end or .between methods)
   */
  endsAt?: Date | number;
}

export class DateValidator<
  Shape extends DateConstructor = DateConstructor,
  Input extends string | number | Date = Date,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static date = DateValidator.createFactory(DateValidator);

  protected _toJSON(ctx?: IJSONSchemaContext<IDateValidatorOptions>) {
    return {
      type: "Date",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      startsAt: ctx?.validatorOptions?.startsAt,
      endsAt: ctx?.validatorOptions?.endsAt,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(_ctx?: ISampleDataContext<IDateValidatorOptions>) {
    return this.Sample ?? (new Date() as Input);
  }

  protected _toStatic(
    ctx?: IStaticContext<IDateValidatorOptions>,
  ): DateValidator<Shape, Input, Output> {
    return DateValidator.date(ctx?.validatorOptions);
  }

  constructor(options?: IDateValidatorOptions) {
    super(ValidatorType.NON_PRIMITIVE, "date", options);

    this._custom(async (ctx) => {
      const Output = new Date(ctx.output);

      if (
        !ctx.output ||
        Output.toString() === "Invalid Date" ||
        isNaN(Output as any)
      ) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Value is not a valid date!",
        );
      }

      const Input = Number(ctx.output);

      if (
        ctx.validatorOptions?.startsAt instanceof Date ||
        typeof ctx.validatorOptions?.startsAt === "number"
      ) {
        if (Input < Number(ctx.validatorOptions.startsAt)) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.smaller,
            "Date is smaller than minimum!",
          );
        }
      }

      if (
        ctx.validatorOptions?.endsAt instanceof Date ||
        typeof ctx.validatorOptions?.endsAt === "number"
      ) {
        if (Input > Number(ctx.validatorOptions.endsAt)) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.greater,
            "Date is greater than maximum!",
          );
        }
      }

      ctx.output = Output;
    }, true);
  }

  public between(options: { start?: Date | number; end?: Date | number }) {
    const Options = typeof options === "object"
      ? options
      : { start: options, end: options };

    this["ValidatorOptions"].startsAt = Options.start ??
      this["ValidatorOptions"].startsAt;
    this["ValidatorOptions"].endsAt = Options.end ??
      this["ValidatorOptions"].endsAt;

    return this;
  }

  public start(at: Date | number) {
    return this.between({ start: at });
  }

  public end(at: Date | number) {
    return this.between({ end: at });
  }
}
