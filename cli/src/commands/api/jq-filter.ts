import jq from "@michaelhomer/jqjs";

/**
 * Apply a jq filter expression to JSON data
 * @param data - Input JSON data
 * @param expression - jq filter expression (e.g., '.items[].name')
 * @returns Filtered result(s)
 * @throws Error if the jq expression is invalid
 */
export function applyJqFilter(data: unknown, expression: string): unknown {
	const filter = jq.compile(expression);
	const results = [...filter(data)];

	// If single result, return it directly; otherwise return array
	return results.length === 1 ? results[0] : results;
}

/**
 * Format jq filter output for display
 * Strings are output without quotes, other types are JSON formatted
 */
export function formatJqOutput(result: unknown, indent = 2): string {
	if (result === undefined || result === null) {
		return String(result);
	}

	if (typeof result === "string") {
		// Raw string output without quotes (like jq)
		return result;
	}

	return JSON.stringify(result, null, indent);
}
