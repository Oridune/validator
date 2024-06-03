// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../../exceptions.ts";
import type { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  type IBaseValidatorOptions,
  type IJSONSchemaOptions,
  type ISampleDataOptions,
  ValidatorType,
} from "../base.ts";
import { OptionalValidator } from "../utility/optional.ts";

export interface IRecordValidatorOptions extends IBaseValidatorOptions {
  key?: BaseValidator<any, any, any>;
  cast?: boolean;
  splitter?: string | RegExp;
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class RecordValidator<
  Type extends BaseValidator<any, any, any>,
  Input,
  Output,
> extends BaseValidator<Type, Input, Output> {
  protected Options: IRecordValidatorOptions;
  protected Validator?: Type | (() => Type);

  protected _toJSON(_options?: IJSONSchemaOptions) {
    const Validator = this.Validator &&
      BaseValidator.resolveValidator(this.Validator);

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
    options: IRecordValidatorOptions | BaseValidator<any, any, any> = {},
  ) {
    const Options = options instanceof BaseValidator
      ? { key: options }
      : options;

    super(ValidatorType.NON_PRIMITIVE, Options);

    this.Validator = validator;
    this.Options = Options;

    this._custom(async (ctx) => {
      if (this.Options.cast && typeof ctx.output === "string") {
        try {
          ctx.output = JSON.parse(ctx.output);
        } catch {
          // Do nothing...
        }
      }

      if (typeof ctx.output !== "object" || ctx.output === null) {
        throw await this._resolveErrorMessage(
          this.Options.messages?.typeError,
          "Invalid object has been provided!",
        );
      }

      ctx.output = { ...ctx.output };

      const Exception = new ValidationException();

      if (this.Validator) {
        const KeyValidator = this.Options.key &&
          BaseValidator.resolveValidator(this.Options.key);
        const Validator = BaseValidator.resolveValidator(this.Validator);

        for (const [Index, Input] of Object.entries(ctx.output)) {
          try {
            let Key = Index;

            if (KeyValidator) {
              Key = await KeyValidator.validate(Key);
            }

            ctx.output[Key] = await Validator.validate(Input, {
              ...ctx,
              location: `${ctx.location}.${Key}`,
              index: Key,
              property: Key,
              parent: ctx,
            });

            if (
              ctx.output[Key] === undefined &&
              Validator instanceof OptionalValidator &&
              (Validator["Options"].deletePropertyIfUndefined === true ||
                (Validator["Options"].deletePropertyIfUndefined !== false &&
                  !(Key in ctx.input)))
            ) {
              delete ctx.output[Key];
            }
          } catch (error) {
            Exception.pushIssues(error);
          }
        }
      }

      if (Exception.issues.length) throw Exception;
    });
  }
}
