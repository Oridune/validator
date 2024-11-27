export class JSON {
    static stringify(
        data: unknown,
        replacer: null | ((key: string, value: unknown) => unknown) | string[] =
            null,
        space: string | number = 0,
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
            const Indent = indent +
                new Array(indentLength).fill(indentChar).join("");

            // Handle primitives
            if (data === null) return "null";

            if (
                typeof data === "boolean" ||
                typeof data === "number"
            ) return String(data);

            if (typeof data === "string") {
                return `"${data.replace(/"/g, '\\"')}"`;
            }

            // Undefined, Symbols, and Functions are ignored in JSON.stringify
            if (
                typeof data === "undefined" ||
                typeof data === "function" ||
                typeof data === "symbol"
            ) return undefined;

            // Handle arrays
            // if (Array.isArray(value)) {
            //     if (visited.has(value)) return '"[Circular]"';

            //     visited.add(value);

            //     const items = value.map((item) => {
            //         const serialized = serialize(
            //             applyReplacer("", item),
            //             Indent,
            //         );

            //         return serialized !== undefined
            //             ? Indent + serialized
            //             : "null";
            //     }).join(prettify ? ",\n" : undefined);

            //     visited.delete(value);

            //     return `[${prettify ? "\n" : ""}${items}${
            //         prettify ? "\n" : ""
            //     }${Indent}]`;
            // }

            // Handle objects
            if (typeof data === "object") {
                if (visited.has(data)) return '"[Circular]"';

                visited.add(data);

                // const contents: string[] = [];

                // for (const [key, value] of Object.entries(data)) {
                //     const serializedValue = serialize(
                //         applyReplacer(key, value),
                //         Indent,
                //     );

                //     if (serializedValue !== undefined) {
                //         contents.push(
                //             ,
                //         );
                //     }
                // }

                const contents = Object.entries(data).map(
                    ([key, value]) => {
                        const serializedValue = serialize(
                            applyReplacer(key, value),
                            Indent,
                        );

                        if (serializedValue !== undefined) {
                            return `${Indent}"${key}":${
                                prettify ? " " : ""
                            }${serializedValue}`;
                        }

                        return null;
                    },
                ).filter(Boolean);

                return `{${prettify ? "\n" : ""}${
                    contents.join(prettify ? ",\n" : ",")
                }${prettify ? "\n" : ""}${indent}}`;
            }
            // if (typeof value === "object") {
            //     if (visited.has(value)) return '"[Circular]"';

            //     visited.add(value);

            //     const entries = Object.entries(value)
            //         .map(([key, value]) => {
            //             const serializedValue = serialize(
            //                 applyReplacer(key, value),
            //                 Indent,
            //             );

            //             if (serializedValue !== undefined) {
            //                 return `${Indent}"${key}":${
            //                     prettify ? " " : ""
            //                 }${serializedValue}`;
            //             }

            //             return null;
            //         })
            //         .filter((entry) => entry !== null)
            //         .join(prettify ? ",\n" : undefined);

            //     visited.delete(value);

            //     return `{${prettify ? "\n" : ""}${entries}${
            //         prettify ? "\n" : ""
            //     }${Indent}}`;
            // }

            throw new Error(`Unsupported data type: ${typeof data}`);
        };

        return serialize(data);
    }
}
