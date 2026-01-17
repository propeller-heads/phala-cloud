import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getApiKey } from "@/src/utils/credentials";
import { applyJqFilter, formatJqOutput } from "./jq-filter";
import { apiCommandMeta, apiCommandSchema } from "./command";
import type { ApiCommandInput } from "./command";

// Get CLI version for User-Agent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../../../package.json");
let CLI_VERSION = "unknown";
try {
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
	CLI_VERSION = packageJson.version || "unknown";
} catch {
	// Ignore errors reading package.json
}

/**
 * Parse key=value string fields into an object
 */
function parseStringFields(
	fields: string[] | undefined,
): Record<string, string> {
	const result: Record<string, string> = {};
	for (const field of fields ?? []) {
		const eqIdx = field.indexOf("=");
		if (eqIdx > 0) {
			const key = field.slice(0, eqIdx);
			const value = field.slice(eqIdx + 1);
			result[key] = value;
		}
	}
	return result;
}

/**
 * Parse key:=value JSON fields into an object with proper types
 */
function parseJsonFields(
	fields: string[] | undefined,
): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const field of fields ?? []) {
		const sepIdx = field.indexOf(":=");
		if (sepIdx > 0) {
			const key = field.slice(0, sepIdx);
			const value = field.slice(sepIdx + 2);
			result[key] = parseJsonValue(value);
		}
	}
	return result;
}

/**
 * Parse a string value into its appropriate JSON type
 */
function parseJsonValue(value: string): unknown {
	if (value === "true") return true;
	if (value === "false") return false;
	if (value === "null") return null;

	// Try to parse as number
	if (/^-?\d+$/.test(value)) {
		return Number.parseInt(value, 10);
	}
	if (/^-?\d+\.\d+$/.test(value)) {
		return Number.parseFloat(value);
	}

	// Try to parse as JSON array or object
	if (value.startsWith("[") || value.startsWith("{")) {
		try {
			return JSON.parse(value);
		} catch {
			// Not valid JSON, return as string
		}
	}

	return value;
}

/**
 * Parse header strings into a headers object
 */
function parseHeaders(headers: string[] | undefined): Record<string, string> {
	const result: Record<string, string> = {};
	for (const header of headers ?? []) {
		const colonIdx = header.indexOf(":");
		if (colonIdx > 0) {
			const key = header.slice(0, colonIdx).trim();
			const value = header.slice(colonIdx + 1).trim();
			result[key] = value;
		}
	}
	return result;
}

/**
 * Read request body from file or stdin
 */
function readInputBody(inputPath: string): string {
	if (inputPath === "-") {
		// Read from stdin (fd 0)
		return readFileSync(0, "utf-8");
	}
	return readFileSync(inputPath, "utf-8");
}

/**
 * Check if HTTP method typically has a request body
 */
function methodHasBody(method: string): boolean {
	return !["GET", "HEAD", "OPTIONS"].includes(method);
}

/**
 * Build request body from input options
 */
function buildRequestBody(
	input: ApiCommandInput,
): Record<string, unknown> | string | undefined {
	// --input takes precedence
	if (input.input) {
		const content = readInputBody(input.input);
		// Try to parse as JSON, if it fails return as string
		try {
			return JSON.parse(content);
		} catch {
			return content;
		}
	}

	// Merge string fields and JSON fields
	const stringFields = parseStringFields(input.field);
	const jsonFields = parseJsonFields(input.rawField);
	const merged = { ...stringFields, ...jsonFields };

	if (Object.keys(merged).length === 0) {
		return undefined;
	}

	return merged;
}

export async function runApiCommand(
	input: ApiCommandInput,
	context: CommandContext,
): Promise<number | undefined> {
	const apiKey = input.apiToken || getApiKey();

	if (!apiKey) {
		context.stderr.write(
			'Error: Not authenticated. Run "phala login" first.\n',
		);
		return 1;
	}

	// Create client with User-Agent header
	const client = createClient({
		apiKey,
		headers: {
			"User-Agent": `phala-cli/${CLI_VERSION}`,
		},
	});

	// Build request
	const body = buildRequestBody(input);
	const customHeaders = parseHeaders(input.header);

	// Normalize endpoint (ensure it starts with /)
	const endpoint = input.endpoint.startsWith("/")
		? input.endpoint
		: `/${input.endpoint}`;

	try {
		// Execute request with full response
		const response = await client.requestFull(endpoint, {
			method: input.method,
			body: methodHasBody(input.method) ? body : undefined,
			headers: customHeaders,
		});

		// Output: status + headers (if -i/--include)
		if (input.include) {
			context.stdout.write(
				`HTTP/1.1 ${response.status} ${response.statusText}\n`,
			);
			response.headers.forEach((value, key) => {
				context.stdout.write(`${key}: ${value}\n`);
			});
			context.stdout.write("\n");
		}

		// Output: body (unless --silent)
		if (!input.silent && response.data !== undefined) {
			let output: unknown = response.data;

			// Apply jq filter if provided
			if (input.jq) {
				try {
					output = applyJqFilter(output, input.jq);
				} catch (err) {
					context.stderr.write(
						`Error: jq filter failed: ${(err as Error).message}\n`,
					);
					return 1;
				}
			}

			// Format and print output
			const formatted = formatJqOutput(output);
			context.stdout.write(`${formatted}\n`);
		}

		// Return exit code based on HTTP status
		return response.ok ? 0 : 1;
	} catch (err) {
		const error = err as Error;
		context.stderr.write(`Error: ${error.message}\n`);
		return 1;
	}
}

export const apiCommand = defineCommand({
	path: ["api"],
	meta: apiCommandMeta,
	schema: apiCommandSchema,
	handler: runApiCommand,
});

export default apiCommand;
