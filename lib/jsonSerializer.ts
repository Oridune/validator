import { Value } from "../mod.ts";

export class JSON {
  static stringify(
    data: unknown,
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
    const serialize = (data: unknown, indent = ""): unknown => {
      let comment = "";

      if (data instanceof Value) {
        if (
          !opts?.noComments &&
          typeof data.metadata.__comment === "string"
        ) {
          comment = ` /* ${data.metadata.__comment} */`;
        }

        data = data.value;
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

    return serialize(applyReplacer("", data));
  }
}
