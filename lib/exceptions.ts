// deno-lint-ignore-file no-explicit-any
export interface IValidationIssue {
  message: string;
  label?: string;
  location?: string;
  input?: any;
}

export class ValidationException extends Error {
  public issues: IValidationIssue[] = [];

  public pushIssues(...issues: IValidationIssue[]) {
    this.issues.push(...issues);
    return this;
  }
}
