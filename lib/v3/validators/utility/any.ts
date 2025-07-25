// deno-lint-ignore-file no-explicit-any
import type { TErrorMessage, TPrimitive } from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";

export interface IAnyValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"literalMatchFail", TErrorMessage>>;

  /**
   * Custom type for JSON schema
   */
  type?: string;
}

export class AnyValidator<
  Shape extends any = any,
  Input extends any = any,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static inferTsType(value: unknown) {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";

    const type = typeof value;

    switch (type) {
      case "string":
      case "symbol":
        return `"${String(value)}" | (string & {})`;

      case "number":
        return `${String(value)} | (number & {})`;

      case "boolean":
        return `${String(value)} | (boolean & {})`;

      default:
        return type;
    }
  }

  static any = AnyValidator.createFactory(AnyValidator);

  static value = <T>(value: T, options?: IAnyValidatorOptions) => {
    return AnyValidator.any({
      type: AnyValidator.inferTsType(value),
      ...options,
    }).custom(() => value) as AnyValidator<any, T, T>;
  };

  static literal = <T extends TPrimitive>(
    value: T,
    options?: IAnyValidatorOptions,
  ) => {
    return AnyValidator.any({
      type: AnyValidator.inferTsType(value),
      ...options,
    }).custom(
      async (ctx) => {
        if (ctx.output !== value) {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.literalMatchFail,
            "Literal match failed!",
          );
        }
      },
    ) as AnyValidator<any, T, T>;
  };

  protected override _toJSON(ctx?: IJSONSchemaContext<IAnyValidatorOptions>) {
    return {
      type: "any",
      tsType: ctx?.validatorOptions?.type,
      description: BaseValidator.prepareDescription(
        ctx?.validatorOptions ?? {},
      ),
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(
    _ctx?: ISampleDataContext<IAnyValidatorOptions>,
  ) {
    return this.Sample;
  }

  constructor(options?: IAnyValidatorOptions) {
    super(ValidatorType.UTILITY, "any", options);
  }
}
