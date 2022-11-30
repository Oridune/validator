// deno-lint-ignore-file no-empty-interface
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
} from "../base.ts";

export interface IAnyValidatorOptions extends IBaseValidatorOptions {}

export class AnyValidator<Type, Input, Output> extends BaseValidator<
  Type,
  Input,
  Output
> {
  protected Options: IAnyValidatorOptions;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    return {
      type: "any",
      description: this.Description,
    };
  }

  constructor(options: IAnyValidatorOptions = {}) {
    super(options);

    this.Options = options;

    this.custom((ctx) => {
      ctx.output = ctx.input;
    });
  }
}
