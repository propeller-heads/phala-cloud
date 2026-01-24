/**
 * Login Command Tests
 *
 * Tests for device authorization flow error handling.
 */

import { describe, test, expect } from "bun:test";
import {
	BusinessError,
	ResourceError,
	formatStructuredError,
} from "@phala/cloud";
import { extractRfc8628Error } from "./error-handling";

// Test the error handling logic by creating errors and checking behavior
describe("Login error handling", () => {
	describe("ResourceError (StructuredError from SDK)", () => {
		test("ResourceError is instanceof BusinessError", () => {
			// ResourceError extends BusinessError, so this should be true
			const error = new ResourceError("Token limit exceeded", {
				status: 400,
				statusText: "Bad Request",
				errorCode: "ERR-05-001",
				suggestions: ["Revoke unused tokens"],
				links: [{ url: "https://example.com", label: "Manage tokens" }],
			});

			expect(error instanceof BusinessError).toBe(true);
			expect(error instanceof ResourceError).toBe(true);
		});

		test("ResourceError has structured error properties", () => {
			const error = new ResourceError("Token limit exceeded", {
				status: 400,
				statusText: "Bad Request",
				errorCode: "ERR-05-001",
				suggestions: ["Revoke unused tokens", "Check your token list"],
				links: [{ url: "https://example.com/tokens", label: "Manage tokens" }],
			});

			expect(error.errorCode).toBe("ERR-05-001");
			expect(error.message).toBe("Token limit exceeded");
			expect(error.suggestions).toEqual([
				"Revoke unused tokens",
				"Check your token list",
			]);
			expect(error.links).toEqual([
				{ url: "https://example.com/tokens", label: "Manage tokens" },
			]);
		});

		test("formatStructuredError formats ResourceError correctly", () => {
			const error = new ResourceError("Token limit exceeded", {
				status: 400,
				statusText: "Bad Request",
				errorCode: "ERR-05-001",
				suggestions: ["Revoke unused tokens"],
				links: [{ url: "https://example.com/tokens", label: "Manage tokens" }],
			});

			const formatted = formatStructuredError(error);

			expect(formatted).toContain("ERR-05-001");
			expect(formatted).toContain("Token limit exceeded");
			expect(formatted).toContain("Suggestions:");
			expect(formatted).toContain("Revoke unused tokens");
			expect(formatted).toContain("Learn more:");
			expect(formatted).toContain("Manage tokens");
		});

		test("formatStructuredError without suggestions and links", () => {
			const error = new ResourceError("Simple error", {
				status: 400,
				statusText: "Bad Request",
				errorCode: "ERR-01-001",
			});

			const formatted = formatStructuredError(error);

			expect(formatted).toContain("ERR-01-001");
			expect(formatted).toContain("Simple error");
			expect(formatted).not.toContain("Suggestions:");
			expect(formatted).not.toContain("Learn more:");
		});
	});

	describe("BusinessError (RFC 8628 and other errors)", () => {
		test("BusinessError with RFC 8628 detail is not ResourceError", () => {
			const error = new BusinessError("Bad Request", {
				status: 400,
				statusText: "Bad Request",
				detail: {
					error: "authorization_pending",
					error_description: "User has not authorized yet",
				},
			});

			expect(error instanceof BusinessError).toBe(true);
			expect(error instanceof ResourceError).toBe(false);
		});

		test("BusinessError with string detail is not ResourceError", () => {
			const error = new BusinessError("Not found", {
				status: 404,
				statusText: "Not Found",
				detail: "CVM not found",
			});

			expect(error instanceof BusinessError).toBe(true);
			expect(error instanceof ResourceError).toBe(false);
		});
	});

	describe("Error type discrimination in catch block", () => {
		test("ResourceError should be caught before BusinessError check", () => {
			const resourceError = new ResourceError("Token limit", {
				status: 400,
				statusText: "Bad Request",
				errorCode: "ERR-05-001",
			});

			const businessError = new BusinessError("Bad Request", {
				status: 400,
				statusText: "Bad Request",
				detail: { error: "authorization_pending" },
			});

			// Simulate the catch block logic
			function handleError(error: unknown): string {
				// 1. Check ResourceError first (more specific)
				if (error instanceof ResourceError) {
					return "ResourceError";
				}
				// 2. Then check BusinessError
				if (error instanceof BusinessError) {
					return "BusinessError";
				}
				return "Unknown";
			}

			// ResourceError should be caught as ResourceError, not BusinessError
			expect(handleError(resourceError)).toBe("ResourceError");
			expect(handleError(businessError)).toBe("BusinessError");
		});

		test("order matters: BusinessError first would incorrectly catch ResourceError", () => {
			const resourceError = new ResourceError("Token limit", {
				status: 400,
				statusText: "Bad Request",
				errorCode: "ERR-05-001",
			});

			// Wrong order - BusinessError check first
			function handleErrorWrongOrder(error: unknown): string {
				if (error instanceof BusinessError) {
					return "BusinessError";
				}
				if (error instanceof ResourceError) {
					return "ResourceError";
				}
				return "Unknown";
			}

			// This demonstrates why order matters - ResourceError would be caught as BusinessError
			expect(handleErrorWrongOrder(resourceError)).toBe("BusinessError");
		});
	});
});

describe("extractRfc8628Error integration", () => {
	test("extracts RFC 8628 error from BusinessError", () => {
		const error = new BusinessError("Bad Request", {
			status: 400,
			statusText: "Bad Request",
			detail: {
				error: "authorization_pending",
				error_description: "User has not authorized yet",
			},
		});

		const rfc8628 = extractRfc8628Error(error);

		expect(rfc8628).not.toBeNull();
		expect(rfc8628?.error).toBe("authorization_pending");
		expect(rfc8628?.error_description).toBe("User has not authorized yet");
	});

	test("returns null for ResourceError (has error_code)", () => {
		const error = new ResourceError("Token limit", {
			status: 400,
			statusText: "Bad Request",
			detail: {
				error_code: "ERR-05-001",
				message: "Token limit exceeded",
			},
			errorCode: "ERR-05-001",
		});

		const rfc8628 = extractRfc8628Error(error);

		expect(rfc8628).toBeNull();
	});

	test("returns null for BusinessError with string detail", () => {
		const error = new BusinessError("Not found", {
			status: 404,
			statusText: "Not Found",
			detail: "Resource not found",
		});

		const rfc8628 = extractRfc8628Error(error);

		expect(rfc8628).toBeNull();
	});
});
