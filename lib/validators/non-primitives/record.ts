// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import { TErrorMessage } from "../../types.ts";
import {
  ValidatorType,
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";
import { OptionalValidator } from "../utility/optional.ts";

export interface IRecordValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  splitter?: string | RegExp;
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class RecordValidator<
  Type extends BaseValidator<any, any, any>,
  Input,
  Output
> extends BaseValidator<Type, Input, Output> {
  protected Options: IRecordValidatorOptions;
  protected Validator?: Type | (() => Type);

  protected _toJSON(_options?: IJSONSchemaOptions) {
    const Validator =
      this.Validator && BaseValidator.resolveValidator(this.Validator);

    return {
      type: "object",
      description: this.Description,
      additionalProperties: Validator?.["_toJSON"](),
    };
  }

  protected _toSample(_options?: ISampleDataOptions | undefined) {
    return this.Sample ?? ({} as Input);
  }

  constructor(
    validator?: Type | (() => Type),
    options: IRecordValidatorOptions = {}
  ) {
    super(ValidatorType.NON_PRIMITIVE, options);

    this.Validator = validator;
    this.Options = options;

    this._custom(async (ctx) => {
      ctx.output = ctx.input;

      if (this.Options.cast && typeof ctx.output === "string")
        try {
          ctx.output = JSON.parse(ctx.output);
        } catch {
          // Do nothing...
        }

      if (typeof ctx.output !== "object" || ctx.output === null)
        throw await this._resolveErrorMessage(
          this.Options.messages?.typeError,
          "Invalid object has been provided!"
        );

      ctx.output = { ...ctx.output };

      const Exception = new ValidationException();

      if (this.Validator) {
        const Validator = BaseValidator.resolveValidator(this.Validator);

        for (const [Index, Input] of Object.entries(ctx.output))
          try {
            ctx.output[Index] = await Validator.validate(Input, {
              ...ctx,
              location: `${ctx.location}.${Index}`,
              index: Index,
              property: Index,
              parent: ctx,
            });

            if (
              ctx.output[Index] === undefined &&
              Validator instanceof OptionalValidator &&
              (Validator["Options"].deletePropertyIfUndefined === true ||
                (Validator["Options"].deletePropertyIfUndefined !== false &&
                  !(Index in ctx.input)))
            )
              delete ctx.output[Index];
          } catch (error) {
            Exception.pushIssues(error);
          }
      }

      if (Exception.issues.length) throw Exception;
    });
  }
}
