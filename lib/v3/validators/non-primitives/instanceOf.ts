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

export interface IInstanceOfValidatorOptions<
  AllowUndefined extends boolean,
  Input,
  RestArgs extends Array<any>,
  Args = [Input, ...RestArgs][number],
> extends TBaseValidatorOptions {
  /** Pass custom messages for the errors */
  messages?: Partial<Record<"typeError", TErrorMessage>>;

  /**
   * If passed `true`, the validator will act as an optional validator with the default value as the instantiation of the class passed.
   */
  allowUndefined?: AllowUndefined;

  /**
   * If passed `true`, the validator will try to instantiate the class with the input value.
   */
  instantiate?: boolean;

  /**
   * If `instantiate` is set to `true`, the validator tries to instantiate the class with the input value in the first argument, You can pass the rest of the arguments here if any.
   */
  instantiationArgs?: Args[] | ((value: Input) => Args[] | Promise<Args[]>);

  /**
   * If `instantiate` is set to `true`, the validator tries to instantiate the class with the input value in the first argument, You can pass the rest of the arguments here if any.
   */
  instantiationRestArgs?:
    | RestArgs
    | ((value: Input) => RestArgs | Promise<RestArgs>);
}

export class InstanceOfValidator<
  Shape,
  Input = unknown,
  Output = Input,
> extends BaseValidator<Shape, Input, Output> {
  static instanceOf = <
    T extends new (...args: any[]) => any,
    AllowUndefined extends boolean = false,
    Proto = T extends { prototype: any } ? T["prototype"] : unknown,
    RawInput = ConstructorParameters<T>[0],
    Input = AllowUndefined extends true ? RawInput | undefined
      : Exclude<RawInput, undefined>,
    RestArgs = ConstructorParameters<T> extends [any, ...infer R] ? R : never,
  >(
    constructor: T,
    options?: IInstanceOfValidatorOptions<
      AllowUndefined,
      Input,
      RestArgs extends Array<any> ? RestArgs : never
    >,
  ) => new InstanceOfValidator<T, Proto | Input, Proto>(constructor, options);

  protected override _toJSON(
    ctx?: IJSONSchemaContext<IInstanceOfValidatorOptions<any, any, any>>,
  ) {
    return {
      type: this.Constructor.name ?? `${this.Constructor}`,
      description: BaseValidator.prepareDescription(
        ctx?.validatorOptions ?? {},
      ),
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
    } satisfies IValidatorJSONSchema;
  }

  protected override _toSample(
    _ctx?: ISampleDataContext<IInstanceOfValidatorOptions<any, any, any>>,
  ) {
    return this.Sample ??
      ((this.Constructor.name ?? `${this.Constructor}`) as Input);
  }

  protected override _toStatic(
    ctx?: IStaticContext<IInstanceOfValidatorOptions<any, any, any>>,
  ): InstanceOfValidator<Shape, Input, Output> {
    return InstanceOfValidator.instanceOf(
      this.Constructor,
      ctx?.validatorOptions,
    );
  }

  constructor(
    protected Constructor: any,
    options?: IInstanceOfValidatorOptions<any, any, any>,
  ) {
    super(ValidatorType.NON_PRIMITIVE, "instanceOf", options);

    this._custom(async (ctx) => {
      if (!(ctx.output instanceof this.Constructor)) {
        try {
          if (
            !ctx.validatorOptions?.instantiate ||
            (!ctx.validatorOptions?.allowUndefined && ctx.output === undefined)
          ) throw "Undefined not allowed!";

          const Args =
            typeof ctx.validatorOptions?.instantiationArgs === "function"
              ? await ctx.validatorOptions?.instantiationArgs(ctx.output)
              : ctx.validatorOptions?.instantiationArgs instanceof Array
              ? ctx.validatorOptions?.instantiationArgs
              : [
                ctx.output,
                ...(typeof ctx.validatorOptions?.instantiationRestArgs ===
                    "function"
                  ? await ctx.validatorOptions?.instantiationRestArgs(
                    ctx.output,
                  )
                  : ctx.validatorOptions?.instantiationRestArgs ?? []),
              ];

          ctx.output = new this.Constructor(...Args);
        } catch {
          throw await BaseValidator.resolveErrorMessage(
            ctx.validatorOptions?.messages?.typeError,
            `Value is not an instanceOf ${this.Constructor.name}!`,
          );
        }
      }
    }, true);
  }
}
