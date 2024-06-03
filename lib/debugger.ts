import { blue, dim, gray, green, red, yellow } from "@std/fmt/colors";
import { ValidationException } from "./exceptions.ts";

export type TDebuggerDetails = {
  label: string;
  tags?: string[];
  config?: object;
  output?: unknown;
  thrown?: unknown;
};

export type TLogFilters = {
  label?: string | string[];
};

export class ValidationDebugger {
  static enabled = false;
  static logFilters: TLogFilters = {};

  protected Tabs = 0;
  protected Logs: Array<[number, boolean, TDebuggerDetails]> = [];

  constructor(protected Label = "Validation Debugger") {}

  public stringify(obj: unknown, space?: number) {
    const seen = new WeakSet();

    return JSON.stringify(
      obj,
      (_, value) => {
        if (typeof value === "bigint") return `${value}n`;
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return "[Circular]";

          seen.add(value);
        }

        return value;
      },
      space,
    );
  }

  public entry(details: TDebuggerDetails) {
    this.Logs.push([this.Tabs, true, details]);
    this.Tabs++;

    return this;
  }

  public exit(details: TDebuggerDetails) {
    this.Tabs--;
    this.Logs.push([this.Tabs, false, details]);

    return this;
  }

  public log() {
    if (this.Tabs === 0) {
      console.log();
      console.log(
        gray(
          [this.Label, "-----------------------------------------------"].join(
            " ",
          ),
        ),
      );
      console.log();

      for (const [tab, isEntry, details] of this.Logs) {
        if (
          ValidationDebugger.logFilters.label &&
          details.label !== ValidationDebugger.logFilters.label
        ) continue;

        const Space = new Array(tab).fill("    ").join("");

        const ErrorMsg = details.thrown instanceof ValidationException
          ? details.thrown.issues.at(-1)?.message
          : details.thrown instanceof Error
          ? details.thrown.message
          : details.thrown;

        console.log(
          Space,
          isEntry
            ? green("--> " + details.label)
            : blue("<-- " + details.label),
          ...(details.tags ?? []),
          ...(typeof ErrorMsg === "string" ? [red("Error: " + ErrorMsg)] : []),
        );

        if (details.config) {
          for (const [key, value] of Object.entries(details.config)) {
            console.log(
              Space + "    ",
              dim(
                `${key} => ${this.stringify(value)}`,
              ),
            );
          }
        }

        if (details.output !== undefined) {
          console.log(
            Space + "    ",
            yellow(
              `Output: ${this.stringify(details.output)}`,
            ),
          );
        }
      }

      console.log();
      console.log(
        gray(
          [this.Label, "-----------------------------------------------"].join(
            " ",
          ),
        ),
      );
      console.log();
    }

    return this;
  }
}
