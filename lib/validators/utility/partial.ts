// deno-lint-ignore-file
import e from "../../validators.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";
import { ObjectValidator } from "../non-primitives/object.ts";
import { IOptionalValidatorOptions } from "./optional.ts";

export interface IPartialValidatorOptions<Ignore>
  extends IBaseValidatorOptions,
    IOptionalValidatorOptions {
  ignore?: Ignore[];
}

export type PartialAdvance<T, I extends string | number | symbol> = {
  [P in Exclude<keyof T, I>]?: T[P];
} & (I extends keyof T ? { [K in I]: T[I] } : { [P in keyof T]?: T[P] });

export class PartialValidator<
  Type extends ObjectValidator<any, any, any>,
  Input,
  Output
> extends BaseValidator<Type, Input, Output> {
  protected Options: IPartialValidatorOptions<unknown>;
  protected Validator: Type;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return this.Validator["_toJSON"]();
  }

  constructor(
    validator: Type,
    options: IPartialValidatorOptions<unknown> = {}
  ) {
    super(options);

    if (!(validator instanceof ObjectValidator))
      throw new Error("Invalid object validator instance has been provided!");
    else
      validator["Shape"] = Object.entries(validator["Shape"]).reduce(
        (shape, [key, value]) => ({
          ...shape,
          [key]: this.Options.ignore?.includes(key)
            ? value
            : e.optional(value, this.Options),
        }),
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
