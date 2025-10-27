import { z } from "zod";
import type { FetchError, FetchRequest } from "ofetch";

/**
 * API Error Response Schema
 */
export const ApiErrorSchema = z.object({
  detail: z
    .union([
      z.string(),
      z.array(
        z.object({
          msg: z.string(),
          type: z.string().optional(),
          ctx: z.record(z.unknown()).optional(),
        }),
      ),
      z.record(z.unknown()),
    ])
    .optional(),
  type: z.string().optional(),
  code: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * Structured validation error item from FastAPI/Pydantic
 */
export interface ValidationErrorItem {
  /** Field path (e.g., "name", "body.memory", "query.page") */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Error type from Pydantic (e.g., "string_too_short", "greater_than_equal") */
  type: string;
  /** Additional context (e.g., { min_length: 4 }) */
  context?: Record<string, unknown>;
}

/**
 * Base class for all Phala Cloud API errors
 */
export class PhalaCloudError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly detail?:
    | string
    | Record<string, unknown>
    | Array<{ msg: string; type?: string; ctx?: Record<string, unknown> }>;

  constructor(
    message: string,
    data: {
      status: number;
      statusText: string;
      detail?:
        | string
        | Record<string, unknown>
        | Array<{ msg: string; type?: string; ctx?: Record<string, unknown> }>;
    },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = data.status;
    this.statusText = data.statusText;
    this.detail = data.detail;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Base error class for HTTP requests
 * Extends PhalaCloudError with additional HTTP-specific properties
 */
export class RequestError extends PhalaCloudError implements ApiError {
  public readonly name = "RequestError";
  public readonly isRequestError = true as const; // Type discriminator
  public readonly data?: unknown;
  public readonly request?: FetchRequest | undefined;
  public readonly response?: Response | undefined;
  public readonly code?: string | undefined;
  public readonly type?: string | undefined;

  constructor(
    message: string,
    options?: {
      status?: number | undefined;
      statusText?: string | undefined;
      data?: unknown;
      request?: FetchRequest | undefined;
      response?: Response | undefined;
      cause?: unknown;
      detail?:
        | string
        | Record<string, unknown>
        | Array<{ msg: string; type?: string; ctx?: Record<string, unknown> }>;
      code?: string | undefined;
      type?: string | undefined;
    },
  ) {
    super(message, {
      status: options?.status ?? 0,
      statusText: options?.statusText ?? "Unknown Error",
      detail: options?.detail || message,
    });

    this.data = options?.data;
    this.request = options?.request;
    this.response = options?.response;
    this.code = options?.code;
    this.type = options?.type;
  }

  /**
   * Create RequestError from FetchError
   */
  static fromFetchError(error: FetchError): RequestError {
    // Try to parse the error response as ApiError
    const parseResult = ApiErrorSchema.safeParse(error.data);

    if (parseResult.success) {
      return new RequestError(error.message, {
        status: error.status ?? undefined,
        statusText: error.statusText ?? undefined,
        data: error.data,
        request: error.request ?? undefined,
        response: error.response ?? undefined,
        detail: parseResult.data.detail as
          | string
          | Record<string, unknown>
          | Array<{
              msg: string;
              type?: string;
              ctx?: Record<string, unknown>;
            }>,
        code: parseResult.data.code ?? undefined,
        type: parseResult.data.type ?? undefined,
      });
    }

    // Fallback to raw error data
    return new RequestError(error.message, {
      status: error.status ?? undefined,
      statusText: error.statusText ?? undefined,
      data: error.data,
      request: error.request ?? undefined,
      response: error.response ?? undefined,
      detail: error.data?.detail || "Unknown API error",
      code: error.status?.toString() ?? undefined,
    });
  }

  /**
   * Create RequestError from generic Error
   */
  static fromError(error: Error, request?: FetchRequest): RequestError {
    return new RequestError(error.message, {
      request: request ?? undefined,
      detail: error.message,
    });
  }
}

/**
 * Validation error from FastAPI/Pydantic (422)
 * Use instanceof to check: if (error instanceof ValidationError) { ... }
 * Or use property: if (error.isValidationError) { ... }
 */
export class ValidationError extends PhalaCloudError {
  public readonly isValidationError = true as const;
  public readonly validationErrors: ValidationErrorItem[];

  constructor(
    message: string,
    data: {
      status: number;
      statusText: string;
      detail?:
        | string
        | Record<string, unknown>
        | Array<{ msg: string; type?: string; ctx?: Record<string, unknown> }>;
      validationErrors: ValidationErrorItem[];
    },
  ) {
    super(message, data);
    this.validationErrors = data.validationErrors;
  }
}

/**
 * Authentication/Authorization error (401, 403)
 * Use instanceof to check: if (error instanceof AuthError) { ... }
 * Or use property: if (error.isAuthError) { ... }
 */
export class AuthError extends PhalaCloudError {
  public readonly isAuthError = true as const;
}

/**
 * Business logic error (400, 409, etc.)
 * Use instanceof to check: if (error instanceof BusinessError) { ... }
 * Or use property: if (error.isBusinessError) { ... }
 */
export class BusinessError extends PhalaCloudError {
  public readonly isBusinessError = true as const;
}

/**
 * Server error (500+)
 * Use instanceof to check: if (error instanceof ServerError) { ... }
 * Or use property: if (error.isServerError) { ... }
 */
export class ServerError extends PhalaCloudError {
  public readonly isServerError = true as const;
}

/**
 * Unknown error (network issues, etc.)
 * Use instanceof to check: if (error instanceof UnknownError) { ... }
 * Or use property: if (error.isUnknownError) { ... }
 */
export class UnknownError extends PhalaCloudError {
  public readonly isUnknownError = true as const;
}

/**
 * FastAPI validation error detail structure
 */
interface FastApiValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
  ctx?: Record<string, unknown>;
}

/**
 * Extract field path from Pydantic location array
 * @example ["body", "name"] => "name"
 * @example ["query", "page"] => "page"
 * @example ["body", "resources", "memory"] => "resources.memory"
 */
function extractFieldPath(loc: (string | number)[]): string {
  // Remove location prefixes like "body", "query", "path"
  const filtered = loc.filter((part) => {
    if (typeof part === "string") {
      return !["body", "query", "path", "header"].includes(part);
    }
    return true;
  });

  // Join remaining parts with dots
  return filtered.length > 0 ? filtered.join(".") : "unknown";
}

/**
 * Parse FastAPI/Pydantic validation errors (422)
 */
function parseValidationErrors(detail: unknown): {
  errors: ValidationErrorItem[];
  message: string;
} {
  // FastAPI validation errors are always an array
  if (!Array.isArray(detail)) {
    return {
      errors: [],
      message: typeof detail === "string" ? detail : "Validation error",
    };
  }

  const errors: ValidationErrorItem[] = detail.map((item: FastApiValidationErrorItem) => ({
    field: extractFieldPath(item.loc),
    message: item.msg,
    type: item.type,
    context: item.ctx,
  }));

  // Generate summary message
  const count = errors.length;
  const message =
    count === 1
      ? `Validation failed: ${errors[0]!.message}`
      : `Validation failed (${count} issue${count > 1 ? "s" : ""})`;

  return { errors, message };
}

/**
 * Categorize error type based on status code
 */
function categorizeErrorType(
  status: number,
): "validation" | "auth" | "business" | "server" | "unknown" {
  // Validation errors (422)
  if (status === 422) {
    return "validation";
  }

  // Authentication errors (401)
  if (status === 401) {
    return "auth";
  }

  // Authorization errors (403)
  if (status === 403) {
    return "auth";
  }

  // Business logic errors (400, 409, etc.)
  if (status >= 400 && status < 500) {
    return "business";
  }

  // Server errors (500+)
  if (status >= 500) {
    return "server";
  }

  return "unknown";
}

/**
 * Extract primary message from error detail
 */
function extractPrimaryMessage(status: number, detail: unknown, defaultMessage: string): string {
  // For validation errors, use the parsed message
  if (status === 422 && Array.isArray(detail)) {
    const { message } = parseValidationErrors(detail);
    return message;
  }

  // For string details, use directly
  if (typeof detail === "string") {
    return detail;
  }

  // For object details, try to extract a message
  if (detail && typeof detail === "object" && "message" in detail) {
    const msg = (detail as { message: unknown }).message;
    if (typeof msg === "string") {
      return msg;
    }
  }

  // Fallback to default message
  return defaultMessage;
}

/**
 * Parse RequestError into PhalaCloudError instance
 *
 * Returns the appropriate error subclass based on status code:
 * - 422 → ValidationError (with validationErrors array)
 * - 401, 403 → AuthError
 * - 400, 409, etc. → BusinessError
 * - 500+ → ServerError
 * - Other → UnknownError
 *
 * @param requestError - The RequestError from API call
 * @returns PhalaCloudError subclass instance
 *
 * @example
 * ```typescript
 * try {
 *   await client.post('/cvms', data);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     // TypeScript knows error.validationErrors exists
 *     error.validationErrors.forEach(e => {
 *       console.error(`${e.field}: ${e.message}`);
 *     });
 *   } else if (error instanceof AuthError) {
 *     // Handle auth error
 *   }
 * }
 * ```
 */
export function parseApiError(requestError: RequestError): PhalaCloudError {
  const status = requestError.status ?? 0;
  const statusText = requestError.statusText ?? "Unknown Error";
  const detail = requestError.detail;

  // Categorize error type
  const errorType = categorizeErrorType(status);

  // Extract primary message
  const message = extractPrimaryMessage(status, detail, requestError.message);

  // Common data for all error types
  const commonData = {
    status,
    statusText,
    detail,
  };

  // Return appropriate error subclass
  if (errorType === "validation" && Array.isArray(detail)) {
    const { errors } = parseValidationErrors(detail);
    return new ValidationError(message, {
      ...commonData,
      validationErrors: errors,
    });
  }

  if (errorType === "auth") {
    return new AuthError(message, commonData);
  }

  if (errorType === "business") {
    return new BusinessError(message, commonData);
  }

  if (errorType === "server") {
    return new ServerError(message, commonData);
  }

  return new UnknownError(message, commonData);
}

/**
 * Extract all field names from validation errors
 *
 * @deprecated Use `error instanceof ValidationError` and `error.validationErrors` directly
 */
export function getValidationFields(error: PhalaCloudError): string[] {
  if (error instanceof ValidationError) {
    return error.validationErrors.map((e) => e.field);
  }
  return [];
}

/**
 * Format validation errors for display
 *
 * @param errors - Array of validation error items
 * @param options - Formatting options
 * @returns Formatted string for display
 *
 * @example
 * ```typescript
 * if (error instanceof ValidationError) {
 *   const formatted = formatValidationErrors(error.validationErrors, {
 *     numbered: true,
 *     indent: 2
 *   });
 *   console.error(formatted);
 * }
 * // Output:
 * //   1. name: String should have at least 4 characters
 * //   2. memory: Input should be greater than or equal to 1024
 * ```
 */
export function formatValidationErrors(
  errors: ValidationErrorItem[],
  options?: {
    /** Add numbers to each error (default: true) */
    numbered?: boolean;
    /** Indent size in spaces (default: 2) */
    indent?: number;
    /** Show field names (default: true) */
    showFields?: boolean;
  },
): string {
  const { numbered = true, indent = 2, showFields = true } = options ?? {};

  const indentStr = " ".repeat(indent);

  return errors
    .map((error, index) => {
      const prefix = numbered ? `${index + 1}. ` : "• ";
      const field = showFields ? `${error.field}: ` : "";
      return `${indentStr}${prefix}${field}${error.message}`;
    })
    .join("\n");
}

/**
 * Create a user-friendly error message from PhalaCloudError
 *
 * @param error - Phala Cloud API error
 * @param options - Formatting options
 * @returns Formatted error message
 *
 * @example
 * ```typescript
 * try {
 *   await client.post('/cvms', data);
 * } catch (error) {
 *   if (error instanceof PhalaCloudError) {
 *     console.error(formatErrorMessage(error));
 *   }
 * }
 * // Output:
 * // Validation failed (2 issues)
 * //
 * //   1. name: String should have at least 4 characters
 * //   2. memory: Input should be greater than or equal to 1024
 * ```
 */
export function formatErrorMessage(
  error: PhalaCloudError,
  options?: {
    /** Include field names in validation errors (default: true) */
    showFields?: boolean;
    /** Include error class name in output (default: false) */
    showType?: boolean;
  },
): string {
  const { showFields = true, showType = false } = options ?? {};

  const parts: string[] = [];

  // Add error type if requested
  if (showType) {
    parts.push(`[${error.constructor.name.toUpperCase()}]`);
  }

  // Add primary message
  parts.push(error.message);

  // Add validation errors if present
  if (error instanceof ValidationError && error.validationErrors.length > 0) {
    parts.push("");
    parts.push(formatValidationErrors(error.validationErrors, { showFields }));
  }

  return parts.join("\n");
}

/**
 * Extract error message from API error
 *
 * @param error - API error object
 * @returns Error message string
 */
export function getErrorMessage(error: ApiError): string {
  if (typeof error.detail === "string") {
    return error.detail;
  }

  if (Array.isArray(error.detail)) {
    if (error.detail.length > 0) {
      return error.detail[0]?.msg || "Validation error";
    }
    return "Validation error";
  }

  if (typeof error.detail === "object" && error.detail !== null) {
    return JSON.stringify(error.detail);
  }

  return "Unknown error occurred";
}
