// deno-lint-ignore-file
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
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

  constructor(validator: Type, options: IPickValidatorOptions<unknown> = {}) {
    super(options);

    if (!(validator instanceof ObjectValidator))
      throw new Error("Invalid object validator instance has been provided!");
    else
      validator["Shape"] = Object.entries(validator["Shape"]).reduce(
        (shape, [key, value]) =>
          this.Options.keys?.includes(key) ? { ...shape, [key]: value } : shape,
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
