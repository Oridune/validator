// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../../exceptions.ts";
import type { inferInput, inferOutput, TErrorMessage } from "../../types.ts";
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

export interface IRecordValidatorOptions extends TBaseValidatorOptions {
  partial?: boolean;
  required?: boolean;

  key?: BaseValidator<any, any, any>;
  splitter?: string | RegExp;
  messages?: Partial<Record<"typeError", TErrorMessage>>;
  deletePropertyIfUndefined?: boolean;
}

export class RecordValidator<
  Shape extends BaseValidator<any, any, any>,
  Input extends Record<string | number | symbol, any> = Record<
    string | number | symbol,
    inferInput<Shape>
  >,
  Output = Record<string | number | symbol, inferOutput<Shape>>,
> extends BaseValidator<Shape, Input, Output> {
  static record = RecordValidator.createFactory(RecordValidator);

  protected Validator?: Shape | (() => Shape);

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      ...(ctx.validatorOptions?.partial
        ? { options: { optional: true } }
        : ctx.validatorOptions?.required
        ? { options: { optional: false } }
        : {}),
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IRecordValidatorOptions>) {
    const Validator = this.Validator &&
      BaseValidator.resolveValidator(this.Validator);
    const Context = this.overrideContext(ctx);

    return {
      type: "object",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      additionalProperties: Validator?.toJSON(Context).schema,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(_ctx?: ISampleDataContext<IRecordValidatorOptions>) {
    return this.Sample ?? ({} as Input);
  }

  protected _cast(ctx: IValidatorContext<any, any>) {
    if (typeof ctx.output === "string") {
      try {
        ctx.output = JSON.parse(ctx.output);
      } catch {
        // Do nothing...
      }
    }
  }

  protected _toStatic(
    ctx?: IStaticContext<IRecordValidatorOptions>,
  ): RecordValidator<Shape, Input, Output> {
    const Validator = BaseValidator.resolveValidator(this.Validator);
    const Context = this.overrideContext(ctx);

    return RecordValidator.record(
      Validator.toStatic(Context) as Shape,
      ctx?.validatorOptions,
    );
  }

  constructor(
    validator?: Shape | (() => Shape),
    options?: IRecordValidatorOptions | BaseValidator<any, any, any>,
  ) {
    const Options = options instanceof BaseValidator
      ? { key: options }
      : options;

    super(ValidatorType.NON_PRIMITIVE, "record", Options);

    this.Validator = validator;

    this._custom(async (ctx) => {
      if (typeof ctx.output !== "object" || ctx.output === null) {
        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid object has been provided!",
        );
      }

      // De-referencing
      ctx.output = { ...ctx.output };

      const Exception = new ValidationException();

      if (this.Validator) {
        const KeyValidator = ctx.validatorOptions?.key &&
          BaseValidator.resolveValidator(ctx.validatorOptions.key);
        const Validator = BaseValidator.resolveValidator(this.Validator);
        const Context = this.overrideContext(ctx);

        for (const [Index, Input] of Object.entries(ctx.output)) {
          try {
            let Key = Index;

            if (KeyValidator) Key = await KeyValidator.validate(Key);

            const Location = `${ctx.location}.${Key}`;

            ctx.output[Key] = await Validator.validate(Input, {
              ...Context,
              location: Location,
              index: Key,
              property: Key,
              parent: ctx,
            });

            if (
              ctx.output[Key] === undefined &&
              (ctx.validatorOptions?.deletePropertyIfUndefined === true ||
                (ctx.validatorOptions?.deletePropertyIfUndefined !== false &&
                  !(Key in ctx.input)))
            ) delete ctx.output[Key];
          } catch (error) {
            Exception.pushIssues(error);
          }
        }
      }

      if (Exception.issues.length) throw Exception;
    });
  }
}
