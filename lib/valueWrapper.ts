export type WrapValueType<T> = T extends Array<infer U> ? Value<U>[]
  : T extends object ? { [K in keyof T]: Value<T[K]> }
  : T;

export class Value<T> {
  public value: WrapValueType<T>;

  protected isPlainObject(obj: unknown): obj is Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) {
      return false;
    }

    const proto = Object.getPrototypeOf(obj);

    if (proto === null) {
      return true;
    }

    return proto.constructor === Object;
  }

  constructor(
    value: T,
    public metadata: Record<string, unknown> = {},
  ) {
    this.value = value as WrapValueType<T>;

    if (value instanceof Value) {
      this.value = value.value;
      this.metadata = Object.assign(metadata, value.metadata);
    }
  }

  public plain() {
    const _v = this.value;

    if (_v instanceof Array) {
      return _v.map((item): unknown => {
        if (item instanceof Value) {
          return item.plain();
        }

        return item;
      }) as T;
    }

    if (this.isPlainObject(_v)) {
      return Object.fromEntries(
        Object.entries(_v).map((entry): [string, unknown] => {
          if (entry[1] instanceof Value) {
            return [entry[0], entry[1].plain()];
          }

          return entry;
        }),
      ) as T;
    }

    return _v;
  }

  public stringify(
    replacer: null | ((key: string, value: unknown) => unknown) | string[] =
      null,
    space: string | number = 0,
    opts?: { noComments?: boolean },
  ) {
    const visited = new WeakSet();

    const indentChar = typeof space === "string" ? space : " ";
    const indentLength = Math.min(
      10,
      Math.trunc(
        typeof space === "string"
          ? space.length ? 1 : 0
          : space < 1
          ? 0
          : space,
      ),
    );
    const prettify = !!indentLength;

    // Helper function to determine if a key-value pair should be included
    const applyReplacer = (key: string, value: unknown) => {
      if (typeof replacer === "function") {
        return replacer(key, value);
      }

      if (Array.isArray(replacer)) {
        // Include only keys present in the replacer array
        return replacer.includes(key) ? value : undefined;
      }

      return value; // No replacer, include all
    };

    // Recursive serialization function
    const serialize = (rawData: unknown, indent = ""): unknown => {
      let comment = "";
      let data: unknown;

      if (rawData instanceof Value) {
        if (
          !opts?.noComments &&
          typeof rawData.metadata.comment === "string"
        ) {
          comment = ` /* ${rawData.metadata.comment} */`;
        }

        data = rawData.value;
      }

      const innerIndex = indent +
        new Array(indentLength).fill(indentChar).join("");

      // Undefined, Symbols, and Functions are ignored in JSON.stringify
      if (
        typeof data === "undefined" ||
        typeof data === "function" ||
        typeof data === "symbol"
      ) return undefined;

      // Handle primitives
      if (data === null) return "null" + comment;

      if (
        typeof data === "boolean" ||
        typeof data === "number"
      ) return String(data) + comment;

      if (data instanceof Date) return `"${data.toISOString()}"` + comment;

      if (typeof data === "string") {
        return `"${data.replace(/"/g, '\\"')}"` + comment;
      }

      // Handle objects
      if (typeof data === "object") {
        if (visited.has(data)) return '"[Circular]"' + comment;

        visited.add(data);

        const isArray = Array.isArray(data);

        const contents = Object.entries(data).map(
          ([key, value]) => {
            const serializedValue = serialize(
              applyReplacer(key, value),
              innerIndex,
            );

            if (serializedValue !== undefined) {
              return `${innerIndex}${
                isArray ? "" : `"${key}":${prettify ? " " : ""}`
              }${serializedValue}`;
            }

            return null;
          },
        ).filter(Boolean);

        visited.delete(data);

        const openChar = isArray ? "[" : "{";
        const closeChar = isArray ? "]" : "}";

        const _prettify = prettify && contents.length;

        return openChar +
          `${_prettify ? "\n" : ""}${contents.join(_prettify ? ",\n" : ",")}${
            _prettify ? "\n" : ""
          }${contents.length ? indent : ""}` + closeChar + comment;
      }

      throw new Error(`Unsupported data type: ${typeof data}`);
    };

    return serialize(applyReplacer("", this));
  }
}
