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

export class RecordValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IRecordValidatorOptions;
  protected Validator?: BaseValidator<any, any, any>;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "object",
      description: this.Description,
      additionalProperties: this.Validator?.["_toJSON"](),
    };
  }

  protected _toSample(_options?: ISampleDataOptions | undefined) {
    return this.Sample ?? ({} as Input);
  }

  constructor(validator?: Type, options: IRecordValidatorOptions = {}) {
    super(ValidatorType.NON_PRIMITIVE, options);

    if (validator)
      if (!(validator instanceof BaseValidator))
        throw new Error("Invalid validator instance has been provided!");
      else this.Validator = validator;

    this.Options = options;

    this.custom(async (ctx) => {
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

      if (this.Validator)
        for (const [Index, Input] of Object.entries(ctx.output))
          try {
            ctx.output[Index] = await this.Validator.validate(Input, {
              ...ctx,
              location: `${ctx.location}.${Index}`,
              index: Index,
              property: Index,
              parent: ctx,
            });

            if (
              ctx.output[Index] === undefined &&
              this.Validator instanceof OptionalValidator &&
              (this.Validator["Options"].deletePropertyIfUndefined === true ||
                (this.Validator["Options"].deletePropertyIfUndefined !==
                  false &&
                  !(Index in ctx.input)))
            )
              delete ctx.output[Index];
          } catch (error) {
            Exception.pushIssues(error);
          }

      if (Exception.issues.length) throw Exception;
    });
  }
}
