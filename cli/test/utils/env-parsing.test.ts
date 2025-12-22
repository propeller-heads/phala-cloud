/**
 * Environment Variable Parsing Tests
 *
 * Tests for the -e flag smart parsing logic that supports both
 * KEY=VALUE format and file paths.
 */

import { describe, test, expect } from "bun:test";
import {
	isKeyValueFormat,
	parseEnvInputs,
	dedupeEnvVars,
} from "../../src/utils/env-parsing";

interface EnvVar {
	key: string;
	value: string;
}

describe("isKeyValueFormat", () => {
	describe("should return true for valid KEY=VALUE format", () => {
		test("simple key-value", () => {
			expect(isKeyValueFormat("NODE_ENV=production")).toBe(true);
		});

		test("key with empty value", () => {
			expect(isKeyValueFormat("MY_VAR=")).toBe(true);
		});

		test("value containing equals sign", () => {
			expect(isKeyValueFormat("MY_VAR=a=b=c")).toBe(true);
		});

		test("key starting with underscore", () => {
			expect(isKeyValueFormat("_PRIVATE=secret")).toBe(true);
		});

		test("key with numbers", () => {
			expect(isKeyValueFormat("VAR123=value")).toBe(true);
		});

		test("single character key", () => {
			expect(isKeyValueFormat("A=1")).toBe(true);
		});

		test("value with spaces", () => {
			expect(isKeyValueFormat("MESSAGE=hello world")).toBe(true);
		});

		test("value with special characters", () => {
			expect(isKeyValueFormat("URL=https://example.com?foo=bar")).toBe(true);
		});
	});

	describe("should return false for file paths", () => {
		test("dotenv file", () => {
			expect(isKeyValueFormat(".env")).toBe(false);
		});

		test("relative path", () => {
			expect(isKeyValueFormat("config/.env")).toBe(false);
		});

		test("absolute path", () => {
			expect(isKeyValueFormat("/path/to/.env")).toBe(false);
		});

		test("path with equals in filename", () => {
			// path/to=value would be interpreted as file because "/" is before "="
			expect(isKeyValueFormat("path/to=value")).toBe(false);
		});

		test("windows path", () => {
			expect(isKeyValueFormat("C:\\path\\.env")).toBe(false);
		});

		test("file with .env extension", () => {
			expect(isKeyValueFormat("production.env")).toBe(false);
		});

		test("hidden file", () => {
			expect(isKeyValueFormat(".env.local")).toBe(false);
		});
	});

	describe("should return false for invalid env var names", () => {
		test("key starting with number", () => {
			expect(isKeyValueFormat("123VAR=value")).toBe(false);
		});

		test("key with hyphen", () => {
			expect(isKeyValueFormat("MY-VAR=value")).toBe(false);
		});

		test("key with dot", () => {
			expect(isKeyValueFormat("my.var=value")).toBe(false);
		});

		test("key with space", () => {
			expect(isKeyValueFormat("MY VAR=value")).toBe(false);
		});

		test("empty key", () => {
			expect(isKeyValueFormat("=value")).toBe(false);
		});
	});
});

describe("parseEnvInputs", () => {
	test("parses mixed inputs correctly", () => {
		const inputs = [
			".env",
			"NODE_ENV=production",
			"config/prod.env",
			"DEBUG=true",
		];

		const result = parseEnvInputs(inputs);

		expect(result.files).toEqual([".env", "config/prod.env"]);
		expect(result.keyValues).toEqual([
			{ key: "NODE_ENV", value: "production" },
			{ key: "DEBUG", value: "true" },
		]);
	});

	test("handles empty array", () => {
		const result = parseEnvInputs([]);

		expect(result.files).toEqual([]);
		expect(result.keyValues).toEqual([]);
	});

	test("handles only files", () => {
		const inputs = [".env", ".env.local", "config/secrets.env"];

		const result = parseEnvInputs(inputs);

		expect(result.files).toEqual([".env", ".env.local", "config/secrets.env"]);
		expect(result.keyValues).toEqual([]);
	});

	test("handles only key-values", () => {
		const inputs = ["A=1", "B=2", "C=3"];

		const result = parseEnvInputs(inputs);

		expect(result.files).toEqual([]);
		expect(result.keyValues).toEqual([
			{ key: "A", value: "1" },
			{ key: "B", value: "2" },
			{ key: "C", value: "3" },
		]);
	});

	test("preserves order", () => {
		const inputs = ["A=1", ".env", "B=2", "config.env", "C=3"];

		const result = parseEnvInputs(inputs);

		// Files maintain their relative order
		expect(result.files).toEqual([".env", "config.env"]);
		// Key-values maintain their relative order
		expect(result.keyValues).toEqual([
			{ key: "A", value: "1" },
			{ key: "B", value: "2" },
			{ key: "C", value: "3" },
		]);
	});

	test("handles value with equals sign", () => {
		const inputs = ["CONNECTION_STRING=host=localhost;port=5432"];

		const result = parseEnvInputs(inputs);

		expect(result.keyValues).toEqual([
			{ key: "CONNECTION_STRING", value: "host=localhost;port=5432" },
		]);
	});
});

describe("dedupeEnvVars", () => {
	test("removes duplicates, keeping last value", () => {
		const envs: EnvVar[] = [
			{ key: "A", value: "1" },
			{ key: "B", value: "2" },
			{ key: "A", value: "3" }, // Override A
		];

		const result = dedupeEnvVars(envs);

		expect(result).toEqual([
			{ key: "A", value: "3" },
			{ key: "B", value: "2" },
		]);
	});

	test("handles no duplicates", () => {
		const envs: EnvVar[] = [
			{ key: "A", value: "1" },
			{ key: "B", value: "2" },
		];

		const result = dedupeEnvVars(envs);

		expect(result).toEqual([
			{ key: "A", value: "1" },
			{ key: "B", value: "2" },
		]);
	});

	test("handles empty array", () => {
		const result = dedupeEnvVars([]);

		expect(result).toEqual([]);
	});

	test("handles multiple overrides of same key", () => {
		const envs: EnvVar[] = [
			{ key: "NODE_ENV", value: "development" },
			{ key: "NODE_ENV", value: "staging" },
			{ key: "NODE_ENV", value: "production" },
		];

		const result = dedupeEnvVars(envs);

		expect(result).toEqual([{ key: "NODE_ENV", value: "production" }]);
	});
});

describe("integration: file + key-value override pattern", () => {
	test("simulates: -e .env -e NODE_ENV=production", () => {
		// Simulate reading .env file
		const fileEnvs: EnvVar[] = [
			{ key: "NODE_ENV", value: "development" },
			{ key: "DEBUG", value: "false" },
			{ key: "API_URL", value: "http://localhost:3000" },
		];

		// Parse CLI inputs
		const inputs = [".env", "NODE_ENV=production"];
		const parsed = parseEnvInputs(inputs);

		// Combine: file envs first, then CLI key-values
		const combined = [...fileEnvs, ...parsed.keyValues];

		// Dedupe
		const result = dedupeEnvVars(combined);

		// NODE_ENV should be overridden to "production"
		expect(result).toContainEqual({ key: "NODE_ENV", value: "production" });
		expect(result).toContainEqual({ key: "DEBUG", value: "false" });
		expect(result).toContainEqual({
			key: "API_URL",
			value: "http://localhost:3000",
		});
	});

	test("simulates: -e .env.base -e .env.local -e OVERRIDE=true", () => {
		// Simulate multiple env files being loaded in order
		const baseEnvs: EnvVar[] = [
			{ key: "API_URL", value: "http://base.example.com" },
			{ key: "DEBUG", value: "false" },
		];
		const localEnvs: EnvVar[] = [
			{ key: "API_URL", value: "http://localhost:3000" },
			{ key: "LOCAL_ONLY", value: "true" },
		];

		// Parse CLI inputs
		const inputs = [".env.base", ".env.local", "OVERRIDE=true"];
		const parsed = parseEnvInputs(inputs);

		// Combine in order: base -> local -> CLI key-values
		const combined = [...baseEnvs, ...localEnvs, ...parsed.keyValues];

		// Dedupe
		const result = dedupeEnvVars(combined);

		// API_URL should be from .env.local (later file wins)
		expect(result).toContainEqual({
			key: "API_URL",
			value: "http://localhost:3000",
		});
		// DEBUG from base (not overridden)
		expect(result).toContainEqual({ key: "DEBUG", value: "false" });
		// LOCAL_ONLY from local
		expect(result).toContainEqual({ key: "LOCAL_ONLY", value: "true" });
		// OVERRIDE from CLI
		expect(result).toContainEqual({ key: "OVERRIDE", value: "true" });
	});
});
