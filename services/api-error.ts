export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, options: { status: number; code?: string }) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
  }
}
