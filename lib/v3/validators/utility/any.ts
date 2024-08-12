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
}

export class AnyValidator<
  Shape extends any = any,
  Input extends any = any,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static any = AnyValidator.createFactory(AnyValidator);

  static value = <T>(value: T, options?: IAnyValidatorOptions) =>
    AnyValidator.any(options).custom(() => value) as AnyValidator<any, T, T>;

  static literal = <T extends TPrimitive>(
    value: T,
    options?: IAnyValidatorOptions,
  ) =>
    AnyValidator.any(options).custom(async (ctx) => {
      if (ctx.output !== value) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.literalMatchFail,
          "Literal match failed!",
        );
      }
    }) as AnyValidator<any, T, T>;

  protected _toJSON(ctx?: IJSONSchemaContext<IAnyValidatorOptions>) {
    return {
      type: "any",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(_ctx?: ISampleDataContext<IAnyValidatorOptions>) {
    return this.Sample;
  }

  constructor(options?: IAnyValidatorOptions) {
    super(ValidatorType.UTILITY, "any", options);
  }
}
