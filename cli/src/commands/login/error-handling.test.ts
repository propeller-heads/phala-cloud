import { describe, test, expect } from "bun:test";
import type { PhalaCloudError } from "@phala/cloud";
import { extractRfc8628Error } from "./error-handling";

// Helper to create a mock PhalaCloudError
function createMockError(
	detail:
		| string
		| Record<string, unknown>
		| Array<{ msg: string; type?: string; ctx?: Record<string, unknown> }>
		| null
		| undefined,
): PhalaCloudError {
	return {
		status: 400,
		message: "Bad Request",
		detail: detail ?? undefined,
	} as PhalaCloudError;
}

describe("extractRfc8628Error", () => {
	describe("RFC 8628 format", () => {
		test("parses authorization_pending", () => {
			const error = createMockError({
				error: "authorization_pending",
				error_description: "The authorization request is still pending",
			});

			const result = extractRfc8628Error(error);

			expect(result).not.toBeNull();
			expect(result?.error).toBe("authorization_pending");
			expect(result?.error_description).toBe(
				"The authorization request is still pending",
			);
		});

		test("parses slow_down", () => {
			const error = createMockError({
				error: "slow_down",
				error_description: "Polling too frequently",
			});

			const result = extractRfc8628Error(error);

			expect(result).not.toBeNull();
			expect(result?.error).toBe("slow_down");
		});

		test("parses expired_token", () => {
			const error = createMockError({
				error: "expired_token",
				error_description: "The device code has expired",
			});

			const result = extractRfc8628Error(error);

			expect(result).not.toBeNull();
			expect(result?.error).toBe("expired_token");
		});

		test("parses access_denied", () => {
			const error = createMockError({
				error: "access_denied",
				error_description: "User denied the authorization request",
			});

			const result = extractRfc8628Error(error);

			expect(result).not.toBeNull();
			expect(result?.error).toBe("access_denied");
		});

		test("parses RFC 8628 error without description", () => {
			const error = createMockError({
				error: "slow_down",
			});

			const result = extractRfc8628Error(error);

			expect(result).not.toBeNull();
			expect(result?.error).toBe("slow_down");
			expect(result?.error_description).toBeUndefined();
		});
	});

	describe("StructuredError format (should return null - handled by SDK)", () => {
		test("returns null for StructuredError with error_code", () => {
			// StructuredError has error_code - should be handled by SDK's ResourceError
			const error = createMockError({
				error_code: "ERR-05-001",
				message: "Token limit exceeded",
				suggestions: ["Revoke unused tokens"],
			});

			const result = extractRfc8628Error(error);

			expect(result).toBeNull();
		});

		test("returns null when both error and error_code present", () => {
			// If error_code is present, it's StructuredError, not RFC 8628
			const error = createMockError({
				error: "some_error",
				error_code: "ERR-01-001",
				message: "Some message",
			});

			const result = extractRfc8628Error(error);

			expect(result).toBeNull();
		});
	});

	describe("Invalid or unknown formats", () => {
		test("returns null for string detail", () => {
			const error = createMockError("Something went wrong");
			const result = extractRfc8628Error(error);
			expect(result).toBeNull();
		});

		test("returns null for array detail (validation errors)", () => {
			// FastAPI validation error format - not RFC 8628
			const error = createMockError([
				{ msg: "field required", type: "missing" },
				{ msg: "invalid value", type: "value_error" },
			]);
			const result = extractRfc8628Error(error);
			expect(result).toBeNull();
		});

		test("returns null for null detail", () => {
			const error = createMockError(null);
			const result = extractRfc8628Error(error);
			expect(result).toBeNull();
		});

		test("returns null for undefined detail", () => {
			const error = createMockError(undefined);
			const result = extractRfc8628Error(error);
			expect(result).toBeNull();
		});

		test("returns null for object without recognizable fields", () => {
			const error = createMockError({
				foo: "bar",
				baz: 123,
			});
			const result = extractRfc8628Error(error);
			expect(result).toBeNull();
		});

		test("returns null for object with non-string error field", () => {
			const error = createMockError({
				error: 123,
			});
			const result = extractRfc8628Error(error);
			expect(result).toBeNull();
		});
	});
});
