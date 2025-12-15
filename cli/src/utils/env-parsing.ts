import type { EnvVar } from "@phala/cloud";

export interface ParsedEnvInput {
	files: string[];
	keyValues: EnvVar[];
}

/**
 * Check if input is a KEY=VALUE format (not a file path)
 * Rules:
 * 1. Contains '='
 * 2. Part before '=' is a valid env var name (starts with letter/underscore, contains only alphanumeric/underscore)
 * 3. Part before '=' does not contain path separators (/, \)
 */
export function isKeyValueFormat(input: string): boolean {
	const eqIndex = input.indexOf("=");
	if (eqIndex === -1) return false;

	const key = input.substring(0, eqIndex);

	// Contains path separator → is a file
	if (key.includes("/") || key.includes("\\")) return false;

	// Validate as environment variable name
	return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
}

/**
 * Parse -e inputs into files and key-value pairs
 */
export function parseEnvInputs(inputs: string[]): ParsedEnvInput {
	const result: ParsedEnvInput = { files: [], keyValues: [] };

	for (const input of inputs) {
		if (isKeyValueFormat(input)) {
			const eqIndex = input.indexOf("=");
			const key = input.substring(0, eqIndex);
			const value = input.substring(eqIndex + 1);
			result.keyValues.push({ key, value });
		} else {
			result.files.push(input);
		}
	}

	return result;
}

/**
 * Dedupe env vars, later values override earlier ones
 */
export function dedupeEnvVars(envs: EnvVar[]): EnvVar[] {
	const map = new Map<string, string>();
	for (const env of envs) {
		map.set(env.key, env.value);
	}
	return Array.from(map.entries()).map(([key, value]) => ({ key, value }));
}
