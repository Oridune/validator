// deno-lint-ignore-file no-explicit-any
import { ValidationException } from "../../../exceptions.ts";
import type {
  inferInput,
  inferObjectInput,
  inferObjectOutput,
  inferOutput,
  TErrorMessage,
} from "../../types.ts";
import {
  BaseValidator,
  type IJSONSchemaContext,
  type ISampleDataContext,
  type IStaticContext,
  type IValidatorContext,
  type IValidatorJSONSchema,
  type TBaseValidatorOptions,
  ValidatorType,
} from "../base.ts";
import { OptionalValidator } from "../utility/optional.ts";

export interface IObjectValidatorOptions extends TBaseValidatorOptions {
  partial?: boolean;
  required?: boolean;

  omitKeys?: string[];
  pickKeys?: string[];

  messages?: Partial<Record<"typeError" | "unexpectedProperty", TErrorMessage>>;
  allowUnexpectedProps?: string[] | boolean;
  deletePropertyIfUndefined?: boolean;
}

export class ObjectValidator<
  Shape extends object,
  Input extends object = inferObjectInput<Shape>,
  Output = inferObjectOutput<Shape>,
> extends BaseValidator<Shape, Input, Output> {
  static object = ObjectValidator.createFactory(ObjectValidator);

  //! If any new class properties are created, remember to add them to the .clone() method!
  protected Shape: Shape;
  protected RestValidator?:
    | BaseValidator<any, any, any>
    | (() => BaseValidator<any, any, any>);

  protected resolvedShape(opts?: {
    omitKeys?: string[];
    pickKeys?: string[];
  }) {
    if (opts?.omitKeys || opts?.pickKeys) {
      let Shape = Object.entries(this.Shape);

      if (opts?.omitKeys instanceof Array) {
        Shape = Shape.filter(([key]) => !opts.omitKeys!.includes(key));
      }

      if (opts?.pickKeys instanceof Array) {
        Shape = Shape.filter(([key]) => opts.pickKeys!.includes(key));
      }

      return Object.fromEntries(Shape) as Shape;
    }

    return this.Shape;
  }

  protected resolvedShapeWithKeys(opts?: {
    omitKeys?: string[];
    pickKeys?: string[];
  }) {
    const Shape = this.resolvedShape(opts);
    const Properties = Object.keys(Shape) as Exclude<
      keyof Shape,
      symbol | number
    >[];

    return [Shape, Properties] as const;
  }

  protected overrideContext(ctx: any) {
    return {
      ...ctx,
      ...(ctx.validatorOptions?.partial
        ? { options: { optional: true } }
        : ctx.validatorOptions?.required
        ? { options: { optional: false } }
        : {}),
    };
  }

  protected _toJSON(ctx?: IJSONSchemaContext<IObjectValidatorOptions>) {
    const [Shape, Properties] = this._memo(
      "shape&Keys",
      () => this.resolvedShapeWithKeys(ctx?.validatorOptions),
    );

    const Context = this.overrideContext(ctx);
    const RequiredProps = new Set(Properties);

    const RestValidator = this.RestValidator &&
      BaseValidator.resolveValidator(this.RestValidator);

    return {
      type: "object",
      description: this.Description,
      optional: !!ctx?.validatorOptions?.optional,
      cast: !!ctx?.validatorOptions?.cast,
      properties: Properties.reduce<any>((obj, key) => {
        const Validator = BaseValidator.resolveValidator(Shape[key]);

        if (Validator instanceof OptionalValidator) RequiredProps.delete(key);

        obj[key] = Validator.toJSON(Context).schema;

        return obj;
      }, {}),
      additionalProperties: RestValidator?.toJSON(Context)
        .schema,
      requiredProperties: Array.from(RequiredProps),
    } satisfies IValidatorJSONSchema;
  }

  protected _toSample(ctx?: ISampleDataContext<IObjectValidatorOptions>) {
    const [Shape, Properties] = this._memo(
      "shape&Keys",
      () => this.resolvedShapeWithKeys(ctx?.validatorOptions),
    );

    const Context = this.overrideContext(ctx);

    return (
      this.Sample ??
        (Properties.reduce<any>((obj, key) => {
          const Validator = BaseValidator.resolveValidator(Shape[key]);

          obj[key] = Validator.toSample(Context).data;

          return obj;
        }, {}) as Input)
    );
  }

  protected _toStatic(
    ctx?: IStaticContext<IObjectValidatorOptions>,
  ): ObjectValidator<Shape, Input, Output> {
    const [Shape, Properties] = this._memo(
      "shape&Keys",
      () => this.resolvedShapeWithKeys(ctx?.validatorOptions),
    );

    const Context = this.overrideContext(ctx);
    const NewShape: Record<string, any> = {};

    for (const Key of Properties) {
      NewShape[Key] = BaseValidator.resolveValidator(Shape[Key]).toStatic(
        Context,
      );
    }

    const Validator = ObjectValidator.object(
      NewShape,
      ctx?.validatorOptions,
    );

    if (this.RestValidator) {
      Validator.rest(
        BaseValidator.resolveValidator(this.RestValidator).toStatic(Context),
      );
    }

    return Validator as any;
  }

  protected _cast(ctx: IValidatorContext<any, any>) {
    if (typeof ctx.output === "string") {
      try {
        ctx.output = JSON.parse(ctx.output);
      } catch {
        // Do nothing...
      }
    }
  }

  //! If any new class properties are created, remember to add them to the .clone() method!
  constructor(shape: Shape = {} as Shape, options?: IObjectValidatorOptions) {
    super(ValidatorType.NON_PRIMITIVE, "object", options);

    if (typeof shape !== "object" || shape === null) {
      throw new Error("Invalid object shape has been provided!");
    }

    this.Shape = shape;

    this._custom(async (ctx) => {
      if (typeof ctx.output !== "object" || ctx.output === null) {
        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.typeError,
          "Invalid object has been provided!",
        );
      }

      // De-referencing
      ctx.output = { ...ctx.output };

      const [Shape, Properties] = this._memo(
        "shape&Keys",
        () =>
          this.resolvedShapeWithKeys(
            ctx?.validatorOptions as IObjectValidatorOptions,
          ),
      );

      const Context = this.overrideContext(ctx);

      const UnexpectedProperties = Object.keys(ctx.output).filter(
        (key) =>
          !Properties.includes(key as any) &&
          (ctx.validatorOptions?.allowUnexpectedProps instanceof Array
            ? !ctx.validatorOptions?.allowUnexpectedProps.includes(key)
            : !ctx.validatorOptions?.allowUnexpectedProps),
      );

      if (
        UnexpectedProperties.length &&
        ctx.validatorOptions?.allowUnexpectedProps !== true &&
        !this.RestValidator
      ) {
        ctx.location = `${ctx.location}.${UnexpectedProperties[0]}`;

        throw await this._resolveErrorMessage(
          ctx.validatorOptions?.messages?.unexpectedProperty,
          "Unexpected property has been encountered!",
        );
      }

      const Exception = new ValidationException();

      for (const Property of Properties) {
        const Validator = BaseValidator.resolveValidator(Shape[Property]);

        const Location = `${ctx.location}.${Property}`;

        try {
          ctx.output[Property] = await Validator.validate(
            ctx.output[Property],
            {
              ...Context,
              location: Location,
              index: Property,
              property: Property,
              parent: ctx,
            },
          );

          if (
            ctx.output[Property] === undefined &&
            (ctx.validatorOptions?.deletePropertyIfUndefined === true ||
              (ctx.validatorOptions?.deletePropertyIfUndefined !== false &&
                !(Property in ctx.input)))
          ) delete ctx.output[Property];
        } catch (error) {
          Exception.pushIssues(error);
        }
      }

      if (this.RestValidator) {
        const RestValidator = BaseValidator.resolveValidator(
          this.RestValidator,
        );

        for (const Property of UnexpectedProperties) {
          try {
            const Location = `${ctx.location}.${Property}`;

            ctx.output[Property] =
              (await RestValidator.validate(ctx.output[Property], {
                ...Context,
                location: Location,
                index: Property,
                property: Property,
                parent: ctx,
              })) ?? ctx.output[Property];

            if (
              ctx.output[Property] === undefined &&
              (ctx.validatorOptions?.deletePropertyIfUndefined === true ||
                (ctx.validatorOptions?.deletePropertyIfUndefined !==
                    false &&
                  !(Property in ctx.input)))
            ) delete ctx.output[Property];
          } catch (error) {
            Exception.pushIssues(error);
          }
        }
      }

      if (Exception.issues.length) throw Exception;
    });
  }

  public extends<
    V extends BaseValidator,
    S = V extends BaseValidator<infer S, any, any> ? S : never,
    I = inferInput<V>,
    O = inferOutput<V>,
  >(
    validator: V | (() => V),
  ) {
    const Validator = this.clone();

    const ExtendingValidator = BaseValidator.resolveValidator(validator)
      .toStatic();

    if (!(ExtendingValidator instanceof ObjectValidator)) {
      throw new Error("Invalid object validator provided!");
    }

    Validator["Shape"] = { ...this.Shape, ...ExtendingValidator["Shape"] };

    return Validator as unknown as ObjectValidator<
      Omit<Shape, keyof S> & S,
      Omit<Input, keyof I> & I,
      Omit<Output, keyof O> & O
    >;
  }

  public rest<
    V extends BaseValidator<any, any, any>,
    I = inferInput<V>,
    O = inferOutput<V>,
  >(
    validator: V | (() => V),
  ) {
    this.RestValidator = validator;
    return this as unknown as ObjectValidator<
      Shape,
      Input & Partial<{ [K: string]: I }>,
      Output & Partial<{ [K: string]: O }>
    >;
  }

  //! If any new class properties are created, remember to add them to the .clone() method!
  public clone() {
    const Validator = new ObjectValidator<Shape, Input, Output>(
      { ...this.Shape },
      this.getOptions(),
    );

    if (this.RestValidator !== undefined) {
      Validator["RestValidator"] = this.RestValidator;
    }

    if (this.Description !== undefined) {
      Validator["Description"] = this.Description;
    }

    if (this.Sample !== undefined) Validator["Sample"] = this.Sample;

    // Starting index is 1 because first validator need to be skipped.
    for (let i = 1; i < this.CustomValidators.length; i++) {
      Validator["CustomValidators"].push(this.CustomValidators[i]);
    }

    return Validator;
  }
}
