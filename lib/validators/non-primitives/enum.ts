import { TErrorMessage } from "../../types.ts";
import {
  ValidatorType,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
  IValidatorContext,
} from "../base.ts";

export interface IEnumValidatorOptions extends IBaseValidatorOptions {
  messages?: Partial<Record<"typeError" | "invalidChoice", TErrorMessage>>;
}

export class EnumValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IEnumValidatorOptions;
  protected Choices:
    | Input[]
    | ((ctx: IValidatorContext) => Input[] | Promise<Input[]>);

  protected _toJSON(_options?: IJSONSchemaOptions) {
    if (!(this.Choices instanceof Array))
      return {
        type: "enum",
        description: this.Description,
      };

    const ChoiceTypes = Array.from(
      new Set(this.Choices.map((item) => typeof item))
    );

    return {
      type: ChoiceTypes.length
        ? ChoiceTypes.length === 1
          ? ChoiceTypes[0]
          : ChoiceTypes
        : "enum",
      description: this.Description,
      choices:
        this.Choices instanceof Array
          ? Array.from(new Set(this.Choices.map((item) => `${item}`)))
          : undefined,
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return (
      this.Sample ??
      ((!(this.Choices instanceof Array)
        ? ""
        : this.Choices.join("|")) as Input)
    );
  }

  constructor(
    choices: Input[] | ((ctx: IValidatorContext) => Input[] | Promise<Input[]>),
    options: IEnumValidatorOptions = {}
  ) {
    super(ValidatorType.NON_PRIMITIVE, options);

    if (!(choices instanceof Array) && typeof choices !== "function")
      throw new Error("Invalid choice list has been provided!");

    this.Options = options;
    this.Choices = choices;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (
        !(
          typeof this.Choices === "function"
            ? await this.Choices(ctx)
            : this.Choices
        ).includes(ctx.output)
      )
        throw await this._resolveErrorMessage(
          this.Options?.messages?.invalidChoice,
          "Invalid choice!"
        );
    });
  }
}
