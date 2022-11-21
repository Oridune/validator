// deno-lint-ignore-file no-async-promise-executor no-explicit-any ban-types
import { ValidationException } from "../exceptions.ts";
import {
  BaseValidator,
  inferInput,
  inferOutput,
  IValidationContext,
  JSONSchemaOptions,
  TCustomValidator,
  TCustomValidatorReturn,
} from "./base.ts";
import { OptionalValidator } from "./optional.ts";
import { RecordValidator } from "./record.ts";
import e from "../../mod.ts";

export type ObjectValidatorOptions = {
  casting?: boolean;
  allowUnexpectedProps?: string[];
  strict?: boolean;
  messages?: {
    notObject?: string;
    unexpectedProperty?: string;
  };
  shouldTerminate?: boolean;
};

export type inferObjectInput<T> = {
  [key in keyof T]: inferInput<T[key]>;
};

export type inferObjectOutput<T> = {
  [key in keyof T]: inferOutput<T[key]>;
};

export class ObjectValidator<
  Shape extends object,
  Input,
  Output
> extends BaseValidator<Shape, Input, Output> {
  protected RestValidator?: BaseValidator<any, any, any>;

  protected CustomValidators: TCustomValidator<any, any>[] = [];

  protected _toJSON(_options?: JSONSchemaOptions) {
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
      additionalProperties:
        this.RestValidator?.["_toJSON"]().additionalProperties,
      requiredProperties: Array.from(RequiredProps),
    };
  }

  protected async _validate(
    input: Record<string, unknown>,
    ctx: IValidationContext
  ): Promise<Output> {
    if (this.Options?.shouldTerminate) ctx.shouldTerminate();

    if (this.Options?.casting && typeof input === "string")
      try {
        input = JSON.parse(input);
      } catch {
        // Do nothing...
      }

    if (typeof input !== "object" || input === null)
      throw (
        this.Options.messages?.notObject ?? "Invalid object has been provided!"
      );

    let Result: any = { ...input };

    // Strict Properties Check
    const Properties = Object.keys(this.Shape);
    const ExtraProperties = Object.keys(Result).filter(
      (key) =>
        !Properties.includes(key) &&
        !this.Options.allowUnexpectedProps?.includes(key)
    );

    if (
      ExtraProperties.length &&
      this.Options.strict !== false &&
      !this.RestValidator
    ) {
      ctx.location = `${ctx.location}.${ExtraProperties[0]}`;
      throw (
        this.Options.messages?.unexpectedProperty ??
        "Unexpected property has been encountered!"
      );
    }

    const ErrorList: ValidationException[] = [];

    for (const Property of Properties) {
      if (this.ShouldTerminate && ErrorList.length) break;

      this.ShouldTerminate = false;

      // @ts-ignore Shape is undefined for now...
      const Validator = this.Shape[Property];

      if (Validator instanceof BaseValidator)
        await Validator.validate(Result[Property], {
          ...ctx,
          location: `${ctx.location}.${Property}`,
        })
          .then((result) => {
            Result[Property] = result ?? Result[Property];
          })
          .catch((err) => {
            ErrorList.push(err);
          });
    }

    for (const Property of ExtraProperties) {
      if (this.ShouldTerminate && ErrorList.length) break;

      this.ShouldTerminate = false;

      if (this.RestValidator)
        await this.RestValidator.validate(Result[Property], {
          ...ctx,
          location: `${ctx.location}.${Property}`,
        })
          .then((result) => {
            Result[Property] = result ?? Result[Property];
          })
          .catch((err) => {
            ErrorList.push(err);
          });
    }

    if (ErrorList.length) throw ErrorList;

    for (const Validator of this.CustomValidators) {
      if (this.ShouldTerminate && ErrorList.length) break;

      this.ShouldTerminate = false;

      // Wrapping Validator in a new Promise because Validator will not always be a promise function!
      await new Promise(async (res, rej) => {
        try {
          res(
            await Validator(Result, {
              ...ctx,
              shouldTerminate: () => {
                this.ShouldTerminate = true;
                ctx.shouldTerminate();
              },
              location: ctx.location,
            })
          );
        } catch (err) {
          rej(err);
        }
      })
        .then((res: any) => {
          Result = res ?? Result;
        })
        .catch((err: any) => {
          ErrorList.push(err);
        });
    }

    if (ErrorList.length) throw ErrorList;

    return Result as Output;
  }

  constructor(
    protected Shape: Shape,
    protected Options: ObjectValidatorOptions
  ) {
    super();

    if (typeof this.Shape !== "object" || this.Shape === null) {
      throw new Error("Invalid object shape has been provided!");
    }
  }

  public custom<Return>(
    validator: TCustomValidator<Output, Return>
  ): ObjectValidator<Shape, Input, TCustomValidatorReturn<Return, Output>> {
    this.CustomValidators.push(validator);
    return this as any;
  }

  public extend<ExtendingValidator>(
    validator: ExtendingValidator
  ): ExtendingValidator extends ObjectValidator<
    infer ExtendingShape,
    infer ExtendingInput,
    infer ExtendingOutput
  >
    ? ObjectValidator<
        Shape & ExtendingShape,
        Input & ExtendingInput,
        Output & ExtendingOutput
      >
    : ExtendingValidator extends RecordValidator<
        infer ExtendingShape,
        infer ExtendingInput,
        infer ExtendingOutput
      >
    ? ObjectValidator<
        Shape & ExtendingShape,
        Input & ExtendingInput,
        Output & ExtendingOutput
      >
    : never {
    if (
      !(validator instanceof ObjectValidator) &&
      !(validator instanceof RecordValidator)
    )
      throw new Error("An object or record validator was expected!");

    if (validator instanceof ObjectValidator)
      this.Shape = { ...this.Shape, ...validator.Shape };

    if (validator instanceof RecordValidator) this.RestValidator = validator;

    return this as any;
  }

  public rest<Validator>(validator: Validator) {
    return this.extend(e.record(validator));
  }
}
