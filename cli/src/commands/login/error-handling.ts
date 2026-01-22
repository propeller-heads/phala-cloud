import type { PhalaCloudError } from "@phala/cloud";

/**
 * RFC 8628 standard error format (OAuth Device Authorization)
 * @see https://datatracker.ietf.org/doc/html/rfc8628#section-3.5
 */
export interface Rfc8628Error {
	error: string; // "authorization_pending" | "slow_down" | "expired_token" | "access_denied" | ...
	error_description?: string;
}

/**
 * Extract RFC 8628 error from PhalaCloudError
 *
 * RFC 8628 errors are returned during device authorization flow polling.
 * They have a specific format: { error: "...", error_description: "..." }
 *
 * Note: StructuredError (with error_code) is handled by SDK's ResourceError.
 * This function only handles RFC 8628 format for device auth flow.
 */
export function extractRfc8628Error(
	error: PhalaCloudError,
): Rfc8628Error | null {
	const { detail } = error;

	if (detail && typeof detail === "object" && !Array.isArray(detail)) {
		const detailObj = detail as Record<string, unknown>;

		// RFC 8628 format: has 'error' field, but NOT 'error_code' (which is StructuredError)
		if (
			detailObj.error &&
			typeof detailObj.error === "string" &&
			!detailObj.error_code
		) {
			return {
				error: detailObj.error,
				error_description:
					typeof detailObj.error_description === "string"
						? detailObj.error_description
						: undefined,
			};
		}
	}

	return null;
}
