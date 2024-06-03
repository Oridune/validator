// deno-lint-ignore-file no-explicit-any

export type TErrorMessage = string | (() => string | Promise<string>);

export type IsObject<T, R, F = T, Excludes = never> = T extends
  | ((...args: any[]) => any)
  | (new (...args: any[]) => any)
  | { constructor: new (...args: any[]) => any }
  | Date
  | Array<any>
  | URL
  | URLSearchParams
  | RegExp
  | Excludes ? F
  : T extends object ? R
  : F;

export type IsTuple<T, R, F = R> = T extends [any, ...any] ? R : F;

export type ExtendToTuple<T, E, UseUnion extends boolean = true> = T extends [
  any,
  ...any,
] ? {
    [K in keyof T]: UseUnion extends true ? T[K] | E : T[K] & E;
  }
  : never;

export type ExcludeFromTuple<T, E> = T extends [
  any,
  ...any,
] ? { [K in keyof T]: Exclude<T[K], E> }
  : never;

export type PickNestedKeys<K, P> = K extends `${infer A}.${infer S}`
  ? A extends P ? S : never
  : never;

export type DeepPartial<T> = {
  [K in keyof T]?: IsObject<
    T[K], // Check if this type is a plain object
    DeepPartial<T[K]>, // If type is object than DeepPartial it
    IsTuple<
      T[K], // Else check if type is a tuple type
      ExtendToTuple<T[K], undefined>, // If type is tuple than extend undefined to tuple
      T[K] extends Array<infer R>
        ? Array<IsObject<R, DeepPartial<R>> | undefined>
        : T[K] // Else if type is not a tuple and not an object then if its an array than extend undefined else return type directly
    >
  >;
};

type NoUndefined<T> = Exclude<T, undefined>;

export type DeepRequired<T> = {
  [K in keyof T]-?: IsObject<
    NoUndefined<T[K]>, // Check if this type is a plain object
    DeepRequired<NoUndefined<T[K]>>, // If type is object than DeepRequired it
    IsTuple<
      NoUndefined<T[K]>, // Else check if type is a tuple type
      ExcludeFromTuple<NoUndefined<T[K]>, undefined>, // If type is tuple than exclude undefined to tuple
      NoUndefined<T[K]> extends Array<infer R>
        ? Array<IsObject<NoUndefined<R>, DeepRequired<NoUndefined<R>>>>
        : NoUndefined<T[K]> // Else if type is not a tuple and not an object then if its an array than exclude undefined else return type directly
    >
  >;
};

export type PartialAdvance<T, IgnoreKey extends keyof T = never> = never extends
  IgnoreKey ? Partial<T>
  :
    & Partial<
      Omit<T, IgnoreKey>
    >
    & Pick<T, IgnoreKey>;

type CustomRequired<T> = { [P in keyof T]-?: Exclude<T[P], undefined> };

export type RequiredAdvance<T, IgnoreKey extends keyof T = never> =
  never extends IgnoreKey ? CustomRequired<T>
    :
      & CustomRequired<
        Omit<T, IgnoreKey>
      >
      & Pick<T, IgnoreKey>;

export type OmitAdvance<T, K extends keyof T> = Omit<T, K>;

export type PickAdvance<T, K extends keyof T> = Pick<T, K>;

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void ? I
  : never;
