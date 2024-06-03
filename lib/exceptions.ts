// deno-lint-ignore-file no-explicit-any
export interface IValidationIssue {
  message: string;
  name?: string;
  location?: string;
  input?: any;
  output?: any;
  stack?: string;
}

export class ValidationException extends Error {
  public isFatal = false;
  public issues: IValidationIssue[] = [];

  public throwsFatal() {
    this.isFatal = true;
  }

  public pushIssues(
    ...issues: (string | IValidationIssue | ValidationException | Error)[]
  ) {
    issues.forEach((issue) => {
      if (issue instanceof ValidationException) {
        this.issues = [...this.issues, ...issue.issues];
        if (issue.isFatal) this.isFatal = true;
      } else if (issue instanceof Error) {
        this.issues.push({ message: issue.message, stack: issue.stack });
      } else if (typeof issue === "string") {
        this.issues.push({ message: issue });
      } else if (typeof issue === "object") this.issues.push(issue);
    });

    if (this.isFatal) throw this;
    return this;
  }

  public clone() {
    const Exception = new ValidationException();
    Exception.name = this.name;
    Exception.message = this.message;
    Exception.cause = this.cause;
    Exception.stack = this.stack;
    Exception.isFatal = this.isFatal;
    Exception.issues = this.issues;
    return Exception;
  }

  public reset() {
    this.issues = [];
    return this;
  }
}
