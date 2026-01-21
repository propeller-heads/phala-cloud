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
 * Parse key=value string fields into an object.
 * Supports @file syntax: key=@file.txt reads file content as string value.
 * Use key=@- to read from stdin.
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
			if (value.startsWith("@")) {
				// Read from file or stdin
				const path = value.slice(1);
				result[key] = readFileContent(path);
			} else {
				result[key] = value;
			}
		}
	}
	return result;
}

/**
 * Parse key:=value JSON fields into an object with proper types.
 * Supports @file syntax: key:=@file.json reads and parses file as JSON.
 * Use key:=@- to read JSON from stdin.
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
			if (value.startsWith("@")) {
				// Read from file and parse as JSON
				const path = value.slice(1);
				const content = readFileContent(path);
				try {
					result[key] = JSON.parse(content);
				} catch {
					throw new Error(
						`Failed to parse JSON from file "${path}" for field "${key}"`,
					);
				}
			} else {
				result[key] = parseJsonValue(value);
			}
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

function hasHeader(
	headers: Record<string, string>,
	headerName: string,
): boolean {
	const target = headerName.toLowerCase();
	return Object.keys(headers).some((k) => k.toLowerCase() === target);
}

/**
 * Read content from file or stdin.
 * Supports "@-" for stdin and "@path" for file paths.
 */
function readFileContent(path: string): string {
	if (path === "-") {
		// Read from stdin (fd 0)
		return readFileSync(0, "utf-8");
	}
	return readFileSync(path, "utf-8");
}

/**
 * Read request body from file or stdin (legacy wrapper)
 */
function readInputBody(inputPath: string): string {
	return readFileContent(inputPath);
}

/**
 * Check if HTTP method typically has a request body
 */
function methodHasBody(method: string): boolean {
	return !["GET", "HEAD", "OPTIONS"].includes(method);
}

type BuiltRequestBody = {
	body: Record<string, unknown> | string | undefined;
	defaultContentType?: string;
};

/**
 * Build request body from input options.
 *
 * Notes:
 * - `--input` takes precedence over everything else
 * - `-d/--data` is mutually exclusive with `-f/-F` (to avoid ambiguity)
 */
export function buildApiRequestBody(input: ApiCommandInput): BuiltRequestBody {
	if (input.input && input.data && input.data.length > 0) {
		throw new Error('"-d/--data" cannot be used with "--input"');
	}

	// --input takes precedence
	if (input.input) {
		const content = readInputBody(input.input);
		// Try to parse as JSON, if it fails return as string
		try {
			return { body: JSON.parse(content) };
		} catch {
			return { body: content };
		}
	}

	// -d/--data: cURL-style raw body data
	if (input.data && input.data.length > 0) {
		if (
			(input.field && input.field.length > 0) ||
			(input.rawField && input.rawField.length > 0)
		) {
			throw new Error(
				'"-d/--data" cannot be used with "-f/--field" or "-F/--raw-field"',
			);
		}

		// cURL-style: multiple -d get joined with "&"
		const combined =
			input.data.length === 1 ? input.data[0] : input.data.join("&");

		// If it's valid JSON, send as JSON automatically
		const trimmed = combined.trim();
		if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
			try {
				return { body: JSON.parse(trimmed) };
			} catch {
				// fall through to raw string
			}
		}

		// Match cURL default for -d: application/x-www-form-urlencoded
		return {
			body: combined,
			defaultContentType: "application/x-www-form-urlencoded",
		};
	}

	// Merge string fields and JSON fields
	const stringFields = parseStringFields(input.field);
	const jsonFields = parseJsonFields(input.rawField);
	const merged = { ...stringFields, ...jsonFields };

	if (Object.keys(merged).length === 0) {
		return { body: undefined };
	}

	return { body: merged };
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

	const customHeaders = parseHeaders(input.header);

	// Normalize endpoint (ensure it starts with /)
	const endpoint = input.endpoint.startsWith("/")
		? input.endpoint
		: `/${input.endpoint}`;

	try {
		// Build request
		const { body, defaultContentType } = buildApiRequestBody(input);

		if (defaultContentType && !hasHeader(customHeaders, "content-type")) {
			customHeaders["Content-Type"] = defaultContentType;
		}

		// Auto-switch to POST if body is present and method is still default GET
		const method =
			body !== undefined && input.method === "GET" ? "POST" : input.method;

		// Execute request with full response
		const response = await client.requestFull(endpoint, {
			method,
			body: methodHasBody(method) ? body : undefined,
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
