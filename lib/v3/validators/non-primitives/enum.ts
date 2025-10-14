import type { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type IValidatorContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export interface IEnumValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError" | "invalidChoice", TErrorMessage>>;
}

export class EnumValidator<
  Shape extends unknown = unknown,
  Input = string,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static enum = EnumValidator.createFactory(EnumValidator);

  protected Choices:
    | Input[]
    | ((ctx: IValidatorContext) => Input[] | Promise<Input[]>);

  protected override _toJSON(ctx?: IJSONSchemaContext<IEnumValidatorOptions>) {
    if (!(this.Choices instanceof Array)) {
      return {
        type: "enum",
        description: BaseValidator.prepareDescription(
          ctx?.validatorOptions ?? {},
        ),
        optional: !!ctx?.validatorOptions?.optional,
        cast: !!ctx?.validatorOptions?.cast,
      } satisfies IValidatorJSONSchema;
    }

    const ChoiceTypes = Array.from(
      new Set(this.Choices.map((item) => typeof item)),
    );

    return {
      type: ChoiceTypes.length
        ? ChoiceTypes.length === 1 ? ChoiceTypes[0] : ChoiceTypes
        : "enum",
      description: this.Description,
      choices: this.Choices instanceof Array
        ? Array.from(new Set(this.Choices.map((item) => `${item}`)))
        : undefined,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(
    _ctx?: ISampleDataContext<IEnumValidatorOptions>,
  ) {
    return (
      this.Sample ??
        ((!(this.Choices instanceof Array)
          ? ""
          : this.Choices.join("|")) as Input)
    );
  }

  protected override _toStatic(
    ctx?: IStaticContext<IEnumValidatorOptions>,
  ): EnumValidator<Shape, Input, Output> {
    return EnumValidator.enum(this.Choices, ctx?.validatorOptions);
  }

  constructor(
    choices: Input[] | ((ctx: IValidatorContext) => Input[] | Promise<Input[]>),
    options?: IEnumValidatorOptions,
  ) {
    super(ValidatorType.NON_PRIMITIVE, "enum", options);

    if (!(choices instanceof Array) && typeof choices !== "function") {
      throw new Error("Invalid choice list has been provided!");
    }

    this.Choices = choices;

    this._custom(async (ctx) => {
      if (
        !(
          typeof this.Choices === "function"
            ? await this.Choices(ctx)
            : this.Choices
        ).includes(ctx.output)
      ) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.invalidChoice,
          "Invalid choice!",
        );
      }
    }, true);
  }
}
