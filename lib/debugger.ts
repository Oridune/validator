import { blue, dim, gray, green, red, yellow } from "@std/fmt/colors";
import { ValidationException } from "./exceptions.ts";

export type DebuggerDetails = {
  label: string;
  tags?: string[];
  config?: object;
  output?: unknown;
  thrown?: unknown;
};

export class ValidationDebugger {
  protected Tabs = 0;
  protected Logs: Array<[number, boolean, DebuggerDetails]> = [];

  protected stringify(obj: unknown, space?: number) {
    return JSON.stringify(
      obj,
      (_, value) => typeof value === "bigint" ? `${value}n` : value,
      space,
    );
  }

  constructor(protected Label = "Validation Debugger") {}

  public entry(details: DebuggerDetails) {
    this.Logs.push([this.Tabs, true, details]);
    this.Tabs++;

    return this;
  }

  public exit(details: DebuggerDetails) {
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
              Space + "\t",
              dim(
                `${key} => ${this.stringify(value)}`,
              ),
            );
          }
        }

        if (details.output !== undefined) {
          console.log(
            Space + "\t",
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
