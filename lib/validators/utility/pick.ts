// deno-lint-ignore-file
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";
import { ObjectValidator } from "../non-primitives/object.ts";

export interface IPickValidatorOptions<Keys> extends IBaseValidatorOptions {
  keys?: Keys[];
}

export type PickAdvance<
  T,
  K extends string | number | symbol
> = K extends keyof T ? { [P in K]: T[P] } : {};

export class PickValidator<
  Type extends ObjectValidator<any, any, any>,
  Input,
  Output
> extends BaseValidator<Type, Input, Output> {
  protected Options: IPickValidatorOptions<unknown>;
  protected Validator: Type;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return this.Validator["_toJSON"]();
  }

  protected _toSample(options?: ISampleDataOptions) {
    return this.Sample ?? this.Validator["_toSample"](options);
  }

  constructor(validator: Type, options: IPickValidatorOptions<unknown> = {}) {
    super(options);

    this.Options = options;
    this.Validator = validator;

    if (!(this.Validator instanceof ObjectValidator))
      throw new Error("Invalid object validator instance has been provided!");
    else
      this.Validator["Shape"] = Object.entries(this.Validator["Shape"]).reduce(
        (shape, [key, value]) =>
          this.Options.keys?.includes(key) ? { ...shape, [key]: value } : shape,
        {}
      );

    this.custom(async (ctx) => {
      ctx.output = ctx.input;
      await this.Validator.validate(ctx.output, ctx);
    });
  }
}
