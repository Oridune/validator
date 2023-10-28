// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import { TErrorMessage } from "../../types.ts";
import {
  BaseValidator,
  IBaseValidatorOptions,
  IJSONSchemaOptions,
  ISampleDataOptions,
} from "../base.ts";
import { OptionalValidator } from "../utility/optional.ts";

export interface IObjectValidatorOptions extends IBaseValidatorOptions {
  cast?: boolean;
  allowUnexpectedProps?: string[] | boolean;
  messages?: Partial<Record<"typeError" | "unexpectedProperty", TErrorMessage>>;
}

export class ObjectValidator<
  Type extends object,
  Input,
  Output
> extends BaseValidator<Type, Input, Output> {
  protected Options: IObjectValidatorOptions;
  protected Shape: Type;
  protected RestValidator?: BaseValidator<any, any, any>;

  protected _toJSON(_options?: IJSONSchemaOptions) {
    const Properties = Object.keys(this.Shape);
    const RequiredProps = new Set(Properties);

    return {
      type: "object",
      description: this.Description,
      properties: Properties.reduce((props, key) => {
        // @ts-ignore Shape is undefined...
        const Validator = this.Shape[key];

        if (Validator instanceof BaseValidator) {
          if (Validator instanceof OptionalValidator) RequiredProps.delete(key);

          return {
            ...props,
            [key]: Validator["_toJSON"](),
          };
        }

        return props;
      }, {}),
      // additionalProperties:
      //   this.RestValidator?.["_toJSON"]().additionalProperties,
      requiredProperties: Array.from(RequiredProps),
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    return (
      this.Sample ??
      (Object.keys(this.Shape).reduce((obj, key) => {
        // @ts-ignore Shape is undefined...
        const Validator = this.Shape[key];

        if (Validator instanceof BaseValidator)
          return { ...obj, [key]: Validator["_toSample"]() };

        return obj;
      }, {}) as Input)
    );
  }

  constructor(shape: Type, options: IObjectValidatorOptions = {}) {
    super(options);

    if (typeof shape !== "object" || shape === null)
      throw new Error("Invalid object shape has been provided!");

    this.Shape = shape;
    this.Options = options;

    this.custom(async (ctx) => {
      ctx.output = ctx.input;

      if (this.Options.cast && typeof ctx.output === "string")
        try {
          ctx.output = JSON.parse(ctx.output);
        } catch {
          // Do nothing...
        }

      if (typeof ctx.output !== "object" || ctx.output === null)
        throw await this._resolveErrorMessage(
          this.Options.messages?.typeError,
          "Invalid object has been provided!"
        );

      // De-referencing
      ctx.output = { ...ctx.output };

      // Unexpected Properties Check
      const Properties = Object.keys(this.Shape);
      const UnexpectedProperties = Object.keys(ctx.output).filter(
        (key) =>
          !Properties.includes(key) &&
          (this.Options.allowUnexpectedProps instanceof Array
            ? !this.Options.allowUnexpectedProps.includes(key)
            : !this.Options.allowUnexpectedProps)
      );

      if (
        UnexpectedProperties.length &&
        this.Options.allowUnexpectedProps !== true &&
        !this.RestValidator
      ) {
        ctx.location = `${ctx.location}.${UnexpectedProperties[0]}`;
        throw await this._resolveErrorMessage(
          this.Options.messages?.unexpectedProperty,
          "Unexpected property has been encountered!"
        );
      }

      const Exception = new ValidationException();

      for (const Property of Properties) {
        // @ts-ignore Shape is unknown for now...
        const Validator = this.Shape[Property];

        if (Validator instanceof BaseValidator)
          try {
            ctx.output[Property] = await Validator.validate(
              ctx.output[Property],
              {
                ...ctx,
                location: `${ctx.location}.${Property}`,
                index: Property,
                property: Property,
                parent: ctx,
              }
            );

            if (
              ctx.output[Property] === undefined &&
              Validator instanceof OptionalValidator &&
              (Validator["Options"].deletePropertyIfUndefined === true ||
                (Validator["Options"].deletePropertyIfUndefined !== false &&
                  !(Property in ctx.input)))
            )
              delete ctx.output[Property];
          } catch (error) {
            Exception.pushIssues(error);
          }
      }

      if (this.RestValidator)
        for (const Property of UnexpectedProperties)
          try {
            ctx.output[Property] =
              (await this.RestValidator.validate(ctx.output[Property], {
                ...ctx,
                location: `${ctx.location}.${Property}`,
                index: Property,
                property: Property,
                parent: ctx,
              })) ?? ctx.output[Property];

            if (
              ctx.output[Property] === undefined &&
              this.RestValidator instanceof OptionalValidator &&
              (this.RestValidator["Options"].deletePropertyIfUndefined ===
                true ||
                (this.RestValidator["Options"].deletePropertyIfUndefined !==
                  false &&
                  !(Property in ctx.input)))
            )
              delete ctx.output[Property];
          } catch (error) {
            Exception.pushIssues(error);
          }

      if (Exception.issues.length) throw Exception;
    });
  }

  public extends<
    V extends ObjectValidator<any, any, any>,
    I = V extends ObjectValidator<any, infer R, any> ? R : never,
    O = V extends ObjectValidator<any, any, infer R> ? R : never
  >(validator: V): ObjectValidator<Type, Input & I, Output & O> {
    this.Shape = { ...this.Shape, ...validator["Shape"] };
    return this as any;
  }

  public rest<
    V extends BaseValidator<any, any, any>,
    I = V extends BaseValidator<any, infer R, any> ? R : never,
    O = V extends BaseValidator<any, any, infer R> ? R : never
  >(
    validator: V
  ): ObjectValidator<
    Type,
    Input & Partial<{ [K: string]: I }>,
    Output & Partial<{ [K: string]: O }>
  > {
    this.RestValidator = validator;
    return this as any;
  }
}
