import { logger } from "./logger";

export interface RetryOptions {
	/**
	 * Maximum number of retry attempts (default: 100)
	 */
	maxRetries?: number;

	/**
	 * Delay between retries in milliseconds (default: 3000)
	 */
	retryDelayMs?: number;

	/**
	 * Optional spinner to stop/start during retries
	 */
	spinner?: { stop: (clear?: boolean) => void };

	/**
	 * Whether to log retry attempts (default: true)
	 */
	logRetries?: boolean;
}

/**
 * Retry an async operation on HTTP 409 Conflict errors
 *
 * This is useful for operations that may fail temporarily because
 * the CVM is still processing a previous operation.
 *
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 * @returns The result of the operation
 * @throws The last error if all retries are exhausted or if error is not a 409
 */
export async function retryOnConflict<T>(
	operation: () => Promise<T>,
	options: RetryOptions = {},
): Promise<T> {
	const {
		maxRetries = 100,
		retryDelayMs = 3000,
		spinner,
		logRetries = true,
	} = options;

	let lastError: unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error: unknown) {
			lastError = error;

			// Check if it's a 409 Conflict error
			const errorObj = error as {
				message?: string;
				status?: number;
			};
			const is409 =
				errorObj.message?.includes("409") ||
				errorObj.status === 409 ||
				errorObj.message?.includes("Conflict");

			if (is409 && attempt < maxRetries) {
				// CVM is busy, retry after delay
				if (spinner) {
					spinner.stop(true);
				}

				if (logRetries) {
					logger.warn(
						`CVM is busy, retrying in ${retryDelayMs}ms... (attempt ${attempt + 1}/${maxRetries})`,
					);
				}

				await new Promise((resolve) => setTimeout(resolve, retryDelayMs));

				// Note: Don't restart spinner - logger.startSpinner() wrapper doesn't support .start()
				// The next operation attempt will use its own spinner if needed
			} else {
				// Not a 409 error or max retries exceeded
				throw error;
			}
		}
	}

	// All retries exhausted
	const lastErrorObj = lastError as { message?: string } | undefined;
	throw new Error(
		`Failed after ${maxRetries} retries due to conflicts: ${lastErrorObj?.message || String(lastError)}`,
	);
}
