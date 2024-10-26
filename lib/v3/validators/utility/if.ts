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

export interface IIfValidatorOptions extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;
}

export class IfValidator<
  Shape,
  Input = unknown,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static if = <T>(
    predicate:
      | boolean
      | ((value: T, ...arg: any[]) => boolean | Promise<boolean>),
    options?: IIfValidatorOptions,
  ) => new IfValidator<unknown, T, T>(predicate, options);

  protected override _toJSON(ctx?: IJSONSchemaContext<IIfValidatorOptions>) {
    return {
      type: typeof (this.Sample ?? {}),
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(_ctx?: ISampleDataContext<IIfValidatorOptions>) {
    return this.Sample ?? ({} as Input);
  }

  protected override _toStatic(
    ctx?: IStaticContext<IIfValidatorOptions>,
  ): IfValidator<Shape, Input, Output> {
    return IfValidator.if(this.Predicate as any, ctx?.validatorOptions) as any;
  }

  constructor(
    protected Predicate: Shape,
    options?: IIfValidatorOptions,
  ) {
    super(ValidatorType.UTILITY, "if", options);

    this._custom(async (ctx) => {
      if (
        !(typeof this.Predicate === "function"
          ? await this.Predicate(ctx.input, ctx)
          : this.Predicate)
      ) {
        throw await BaseValidator.resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Value didn't meet the expectation!",
        );
      }
    }, true);
  }
}
