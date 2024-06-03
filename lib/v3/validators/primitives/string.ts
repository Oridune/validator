// deno-lint-ignore-file no-explicit-any
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

export interface IStringValidatorOptions extends TBaseValidatorOptions {
  messages?: Partial<
    Record<
      | "typeError"
      | "smallerLength"
      | "greaterLength"
      | "matchFailed"
      | "invalidChoice"
      | "numberLike"
      | "notNumberLike"
      | "invalidURL",
      TErrorMessage
    >
  >;
  isUrl?: boolean;
  returnURLInstance?: boolean;
  minLength?: number;
  maxLength?: number;
  choices?: string[];
  patterns?: RegExp[];
  isNaN?: boolean;
}

export class StringValidator<
  Shape extends StringConstructor = StringConstructor,
  Input extends string = string,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static string = StringValidator.createFactory(StringValidator);

  static url = <URLInstance extends boolean = false>(
    options?: IStringValidatorOptions & { returnURLInstance?: URLInstance },
  ) => StringValidator.string(options).isURL(options?.returnURLInstance);

  protected _toJSON(ctx?: IJSONSchemaContext<IStringValidatorOptions>) {
    return {
      type: "string",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      isUrl: ctx?.validatorOptions?.isUrl,
      minLength: ctx?.validatorOptions?.minLength,
      maxLength: ctx?.validatorOptions?.maxLength,
      choices: ctx?.validatorOptions?.choices,
      patterns: ctx?.validatorOptions?.patterns?.map((pattern) =>
        pattern.toString()
      ),
      isNaN: ctx?.validatorOptions?.isNaN,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(_ctx?: ISampleDataContext<IStringValidatorOptions>) {
    return this.Sample ?? ("" as Input);
  }

  protected _toStatic(
    ctx?: IStaticContext<IStringValidatorOptions>,
  ): StringValidator<Shape, Input, Output> {
    return StringValidator.string(ctx?.validatorOptions);
  }

  protected _cast(ctx: IValidatorContext<any, any>) {
    if (typeof ctx.output !== "string") ctx.output = `${ctx.output ?? ""}`;
  }

  constructor(options?: IStringValidatorOptions) {
    super(ValidatorType.PRIMITIVE, options);

    this._custom(async (ctx) => {
      if (typeof ctx.output !== "string") {
        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid string has been provided!",
        );
      }

      if (typeof ctx.validatorOptions?.minLength === "number") {
        if (ctx.output.length < ctx.validatorOptions.minLength) {
          throw await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.smallerLength,
            "String is smaller than minimum length!",
          );
        }
      }

      if (typeof ctx.validatorOptions?.maxLength === "number") {
        if (ctx.output.length > ctx.validatorOptions.maxLength) {
          throw await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.greaterLength,
            "String is greater than maximum length!",
          );
        }
      }

      if (ctx.validatorOptions?.choices instanceof Array) {
        if (!ctx.validatorOptions.choices.includes(ctx.output)) {
          throw await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.invalidChoice,
            "Invalid choice!",
          );
        }
      }

      if (ctx.validatorOptions?.patterns?.length) {
        for (const Pattern of ctx.validatorOptions.patterns) {
          if (Pattern instanceof RegExp && !Pattern.test(ctx.output)) {
            throw await this._resolveErrorMessage(
              ctx.validatorOptions?.messages?.matchFailed,
              "String didn't match the expected pattern!",
            );
          }
        }
      }

      if (typeof ctx.validatorOptions?.isNaN === "boolean") {
        const IsNaN = isNaN(`${ctx.output ?? ""}` as unknown as number);

        if (!IsNaN && ctx.validatorOptions.isNaN) {
          throw await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.numberLike,
            "String should not be number like!",
          );
        }

        if (IsNaN && !ctx.validatorOptions.isNaN) {
          throw await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.notNumberLike,
            "String should be number like!",
          );
        }
      }

      if (ctx.validatorOptions?.isUrl) {
        try {
          const Url = new URL(`${ctx.output ?? ""}`);

          ctx.output = ctx.validatorOptions?.returnURLInstance
            ? Url
            : Url.toString();
        } catch {
          throw await this._resolveErrorMessage(
            ctx.validatorOptions?.messages?.invalidURL,
            "String is not a valid URL!",
          );
        }
      }
    });
  }

  public length(options: { min?: number; max?: number } | number) {
    const Options = typeof options === "object"
      ? options
      : { min: options, max: options };

    this["ValidatorOptions"].minLength = Options.min ??
      this["ValidatorOptions"].minLength;
    this["ValidatorOptions"].maxLength = Options.max ??
      this["ValidatorOptions"].maxLength;

    return this;
  }

  public min(length: number) {
    return this.length({ min: length });
  }

  public max(length: number) {
    return this.length({ max: length });
  }

  public matches(options: { regex: RegExp | RegExp[] } | RegExp | RegExp[]) {
    const Options = options instanceof RegExp || options instanceof Array
      ? { regex: options }
      : options;

    const Patterns = Options.regex instanceof Array
      ? Options.regex
      : [Options.regex];

    for (const Pattern of Patterns) {
      if (!(Pattern instanceof RegExp)) {
        throw new Error(
          `Invalid regular expression '${Pattern}' has been provided!`,
        );
      }
    }

    this["ValidatorOptions"].patterns = Patterns;

    return this;
  }

  public in<C extends string>(
    choices: C[],
  ): StringValidator<Shape, Input, C> {
    if (!(choices instanceof Array)) {
      throw new Error(
        `Invalid choices array has been provided!`,
      );
    }

    this["ValidatorOptions"].choices = choices;

    return this as any;
  }

  public isNaN() {
    this["ValidatorOptions"].isNaN = true;

    return this;
  }

  public notIsNaN() {
    this["ValidatorOptions"].isNaN = false;

    return this;
  }

  public isURL<URLInstance extends boolean = false>(
    returnURLInstance?: URLInstance,
  ) {
    this["ValidatorOptions"].isUrl = true;
    this["ValidatorOptions"].returnURLInstance = returnURLInstance;

    return this as StringValidator<
      Shape,
      Input,
      URLInstance extends true ? URL : Output
    >;
  }
}
