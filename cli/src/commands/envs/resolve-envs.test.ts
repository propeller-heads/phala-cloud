/**
 * Tests for resolveEnvInputs utility
 */

import { describe, test, expect } from "bun:test";
import { join } from "node:path";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolveEnvInputs } from "./resolve-envs";

describe("resolveEnvInputs", () => {
	let tempDir: string;

	function createTempEnvFile(name: string, content: string): string {
		const filePath = join(tempDir, name);
		writeFileSync(filePath, content);
		return filePath;
	}

	test("parses KEY=VALUE inputs", () => {
		const result = resolveEnvInputs(["NODE_ENV=production", "DEBUG=true"]);

		expect(result).toEqual([
			{ key: "NODE_ENV", value: "production" },
			{ key: "DEBUG", value: "true" },
		]);
	});

	test("loads env vars from file", () => {
		tempDir = mkdtempSync(join(tmpdir(), "envs-test-"));
		const filePath = createTempEnvFile(
			".env",
			"API_KEY=secret123\nDB_HOST=localhost\n",
		);

		const result = resolveEnvInputs([filePath]);

		expect(result).toContainEqual({ key: "API_KEY", value: "secret123" });
		expect(result).toContainEqual({ key: "DB_HOST", value: "localhost" });

		rmSync(tempDir, { recursive: true });
	});

	test("file values are overridden by KEY=VALUE inputs", () => {
		tempDir = mkdtempSync(join(tmpdir(), "envs-test-"));
		const filePath = createTempEnvFile(
			".env",
			"NODE_ENV=development\nDEBUG=false\n",
		);

		const result = resolveEnvInputs([filePath, "NODE_ENV=production"]);

		expect(result).toContainEqual({ key: "NODE_ENV", value: "production" });
		expect(result).toContainEqual({ key: "DEBUG", value: "false" });

		rmSync(tempDir, { recursive: true });
	});

	test("deduplicates keys, last value wins", () => {
		const result = resolveEnvInputs(["A=1", "B=2", "A=3"]);

		expect(result).toEqual([
			{ key: "A", value: "3" },
			{ key: "B", value: "2" },
		]);
	});

	test("throws when file does not exist", () => {
		expect(() => resolveEnvInputs(["/nonexistent/.env"])).toThrow(
			"Environment file not found",
		);
	});

	test("handles empty KEY=VALUE", () => {
		const result = resolveEnvInputs(["EMPTY_VAR="]);

		expect(result).toEqual([{ key: "EMPTY_VAR", value: "" }]);
	});

	test("handles value with equals sign", () => {
		const result = resolveEnvInputs(["CONN=host=db;port=5432"]);

		expect(result).toEqual([{ key: "CONN", value: "host=db;port=5432" }]);
	});
});
