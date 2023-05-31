// deno-lint-ignore-file
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";
import { ObjectValidator } from "../non-primitives/object.ts";

export interface IOmitValidatorOptions<Keys> extends IBaseValidatorOptions {
  keys?: Keys[];
}

export type OmitAdvance<
  T,
  K extends string | number | symbol
> = K extends keyof T ? { [P in Exclude<keyof T, K>]: T[P] } : T;

export class OmitValidator<
  Type extends ObjectValidator<any, any, any>,
  Input,
  Output
> extends BaseValidator<Type, Input, Output> {
  protected Options: IOmitValidatorOptions<unknown>;
  protected Validator: Type;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return this.Validator["_toJSON"]();
  }

  protected _toSample(options?: ISampleDataOptions) {
    return this.Sample ?? this.Validator["_toSample"](options);
  }

  constructor(validator: Type, options: IOmitValidatorOptions<unknown> = {}) {
    super(options);

    if (!(validator instanceof ObjectValidator))
      throw new Error("Invalid object validator instance has been provided!");
    else
      validator["Shape"] = Object.entries(validator["Shape"]).reduce(
        (shape, [key, value]) =>
          this.Options.keys?.includes(key) ? shape : { ...shape, [key]: value },
        {}
      );

    this.Options = options;
    this.Validator = validator;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      await this.Validator.validate(ctx.output, ctx);
    });
  }
}
