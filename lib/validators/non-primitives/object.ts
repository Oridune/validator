// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../exceptions.ts";
import { TErrorMessage, inferInput, inferOutput } from "../../types.ts";
import {
  ValidatorType,
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
  //! If any new class properties are created, remember to add them to the .clone() method!
  protected Shape: Type;
  protected Options: IObjectValidatorOptions;
  protected RestValidator?:
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>);

  protected _toJSON(_options?: IJSONSchemaOptions) {
    const Properties = Object.keys(this.Shape) as Exclude<
      keyof Type,
      symbol | number
    >[];

    const RequiredProps = new Set(Properties);

    const RestValidator =
      this.RestValidator && BaseValidator.resolveValidator(this.RestValidator);

    return {
      type: "object",
      description: this.Description,
      properties: Properties.reduce((props, key) => {
        const Validator = BaseValidator.resolveValidator(this.Shape[key]);

        if (Validator instanceof OptionalValidator) RequiredProps.delete(key);

        return {
          ...props,
          [key]: Validator["_toJSON"](),
        };
      }, {}),
      additionalProperties: RestValidator?.["_toJSON"](),
      requiredProperties: Array.from(RequiredProps),
    };
  }

  protected _toSample(_options?: ISampleDataOptions) {
    const Properties = Object.keys(this.Shape) as Exclude<
      keyof Type,
      symbol | number
    >[];

    return (
      this.Sample ??
      (Properties.reduce((obj, key) => {
        const Validator = BaseValidator.resolveValidator(this.Shape[key]);
        return { ...obj, [key]: Validator["_toSample"]() };
      }, {}) as Input)
    );
  }

  //! If any new class properties are created, remember to add them to the .clone() method!
  constructor(shape: Type, options: IObjectValidatorOptions = {}) {
    super(ValidatorType.NON_PRIMITIVE, options);

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
      const Properties = Object.keys(this.Shape) as Exclude<
        keyof Type,
        symbol | number
      >[];

      const UnexpectedProperties = Object.keys(ctx.output).filter(
        (key) =>
          !Properties.includes(key as any) &&
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
        const Validator = BaseValidator.resolveValidator(this.Shape[Property]);

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

      if (this.RestValidator) {
        const RestValidator = BaseValidator.resolveValidator(
          this.RestValidator
        );

        for (const Property of UnexpectedProperties)
          try {
            ctx.output[Property] =
              (await RestValidator.validate(ctx.output[Property], {
                ...ctx,
                location: `${ctx.location}.${Property}`,
                index: Property,
                property: Property,
                parent: ctx,
              })) ?? ctx.output[Property];

            if (
              ctx.output[Property] === undefined &&
              RestValidator instanceof OptionalValidator &&
              (RestValidator["Options"].deletePropertyIfUndefined === true ||
                (RestValidator["Options"].deletePropertyIfUndefined !== false &&
                  !(Property in ctx.input)))
            )
              delete ctx.output[Property];
          } catch (error) {
            Exception.pushIssues(error);
          }
      }

      if (Exception.issues.length) throw Exception;
    });
  }

  public extends<
    V extends ObjectValidator<any, any, any>,
    I = V extends ObjectValidator<any, infer R, any> ? R : never,
    O = V extends ObjectValidator<any, any, infer R> ? R : never
  >(
    validator: V | (() => V)
  ): ObjectValidator<
    Type,
    Omit<Input, keyof I> & I,
    Omit<Output, keyof O> & O
  > {
    const Validator = this.clone();

    const ExtendingValidator = BaseValidator.resolveValidator(validator);

    if (!(ExtendingValidator instanceof ObjectValidator))
      throw new Error("Invalid object validator provided!");

    Validator["Shape"] = { ...this.Shape, ...ExtendingValidator["Shape"] };

    return Validator as any;
  }

  public rest<
    V extends BaseValidator<any, any, any>,
    I = inferInput<V>,
    O = inferOutput<V>
  >(
    validator: V | (() => V)
  ): ObjectValidator<
    Type,
    Input & Partial<{ [K: string]: I }>,
    Output & Partial<{ [K: string]: O }>
  > {
    this.RestValidator = validator;
    return this as any;
  }

  //! If any new class properties are created, remember to add them to the .clone() method!
  public clone() {
    const Validator = new ObjectValidator<Type, Input, Output>(
      { ...this.Shape },
      this.Options
    );

    Validator["Type"] = this.Type;
    Validator["DeepPartialed"] = this.DeepPartialed;
    Validator["DeepCasted"] = this.DeepCasted;

    if (this.RestValidator !== undefined)
      Validator["RestValidator"] = this.RestValidator;

    if (this.Description !== undefined)
      Validator["Description"] = this.Description;

    if (this.Sample !== undefined) Validator["Sample"] = this.Sample;

    // Starting index is 1 because first validator need to be skipped.
    for (let i = 1; i < this.CustomValidators.length; i++)
      Validator["CustomValidators"].push(this.CustomValidators[i]);

    return Validator;
  }
}
