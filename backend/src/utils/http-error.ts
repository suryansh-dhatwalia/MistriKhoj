export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    /** Optional per-field messages, returned as `errors` like a validation failure. */
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
