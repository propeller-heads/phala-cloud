import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { buildApiRequestBody } from "../../src/commands/api/index";
import type { ApiCommandInput } from "../../src/commands/api/command";

function baseInput(overrides: Partial<ApiCommandInput> = {}): ApiCommandInput {
	return {
		endpoint: "/test",
		method: "GET",
		include: false,
		silent: false,
		...overrides,
	};
}

describe("api command - -d/--data request body", () => {
	test("parses JSON body from -d", () => {
		const result = buildApiRequestBody(baseInput({ data: ['{"foo":"bar"}'] }));

		expect(result.body).toEqual({ foo: "bar" });
		expect(result.defaultContentType).toBeUndefined();
	});

	test("joins multiple -d with & (cURL-style)", () => {
		const result = buildApiRequestBody(baseInput({ data: ["a=1", "b=2"] }));

		expect(result.body).toBe("a=1&b=2");
		expect(result.defaultContentType).toBe("application/x-www-form-urlencoded");
	});

	test("sets default content-type for raw string -d", () => {
		const result = buildApiRequestBody(baseInput({ data: ["xxx"] }));

		expect(result.body).toBe("xxx");
		expect(result.defaultContentType).toBe("application/x-www-form-urlencoded");
	});

	test("errors when -d is used with -f/-F/--input", () => {
		expect(() =>
			buildApiRequestBody(baseInput({ data: ["x"], field: ["a=b"] })),
		).toThrow(
			'"-d/--data" cannot be used with "-f/--field" or "-F/--raw-field"',
		);

		expect(() =>
			buildApiRequestBody(baseInput({ data: ["x"], rawField: ["a:=1"] })),
		).toThrow(
			'"-d/--data" cannot be used with "-f/--field" or "-F/--raw-field"',
		);

		expect(() =>
			buildApiRequestBody(baseInput({ data: ["x"], input: "data.json" })),
		).toThrow('"-d/--data" cannot be used with "--input"');
	});

	test("parses JSON array from -d", () => {
		const result = buildApiRequestBody(baseInput({ data: ["[1,2,3]"] }));

		expect(result.body).toEqual([1, 2, 3]);
		expect(result.defaultContentType).toBeUndefined();
	});

	test("invalid JSON starting with { falls back to raw string", () => {
		const result = buildApiRequestBody(baseInput({ data: ["{invalid"] }));

		expect(result.body).toBe("{invalid");
		expect(result.defaultContentType).toBe("application/x-www-form-urlencoded");
	});

	test("returns undefined body when no body options provided", () => {
		const result = buildApiRequestBody(baseInput({}));

		expect(result.body).toBeUndefined();
		expect(result.defaultContentType).toBeUndefined();
	});

	test("-f/-F fields work without -d", () => {
		const result = buildApiRequestBody(
			baseInput({ field: ["name=test"], rawField: ["count:=42"] }),
		);

		expect(result.body).toEqual({ name: "test", count: 42 });
		expect(result.defaultContentType).toBeUndefined();
	});
});

describe("api command - @file syntax", () => {
	let tmpDir: string;
	let textFile: string;
	let jsonFile: string;
	let invalidJsonFile: string;

	beforeAll(() => {
		tmpDir = mkdtempSync(join(tmpdir(), "api-test-"));
		textFile = join(tmpDir, "content.txt");
		jsonFile = join(tmpDir, "config.json");
		invalidJsonFile = join(tmpDir, "invalid.json");

		writeFileSync(textFile, "Hello from file!");
		writeFileSync(jsonFile, '{"nested": true, "count": 42}');
		writeFileSync(invalidJsonFile, "not valid json {");
	});

	afterAll(() => {
		rmSync(tmpDir, { recursive: true, force: true });
	});

	test("-f reads file content as string with =@", () => {
		const result = buildApiRequestBody(
			baseInput({ field: [`content=@${textFile}`] }),
		);

		expect(result.body).toEqual({ content: "Hello from file!" });
	});

	test("-f with @file mixed with regular fields", () => {
		const result = buildApiRequestBody(
			baseInput({ field: [`content=@${textFile}`, "name=test"] }),
		);

		expect(result.body).toEqual({
			content: "Hello from file!",
			name: "test",
		});
	});

	test("-F reads and parses JSON file with :=@", () => {
		const result = buildApiRequestBody(
			baseInput({ rawField: [`config:=@${jsonFile}`] }),
		);

		expect(result.body).toEqual({
			config: { nested: true, count: 42 },
		});
	});

	test("-F with @file mixed with inline JSON values", () => {
		const result = buildApiRequestBody(
			baseInput({ rawField: [`config:=@${jsonFile}`, "enabled:=true"] }),
		);

		expect(result.body).toEqual({
			config: { nested: true, count: 42 },
			enabled: true,
		});
	});

	test("-f and -F with @file can be combined", () => {
		const result = buildApiRequestBody(
			baseInput({
				field: [`readme=@${textFile}`],
				rawField: [`settings:=@${jsonFile}`],
			}),
		);

		expect(result.body).toEqual({
			readme: "Hello from file!",
			settings: { nested: true, count: 42 },
		});
	});

	test("-F throws error for invalid JSON file", () => {
		expect(() =>
			buildApiRequestBody(
				baseInput({ rawField: [`bad:=@${invalidJsonFile}`] }),
			),
		).toThrow(/Failed to parse JSON from file/);
	});

	test("-f with nonexistent file throws error", () => {
		expect(() =>
			buildApiRequestBody(baseInput({ field: ["x=@/nonexistent/file.txt"] })),
		).toThrow();
	});

	test("literal @ in value without file reference", () => {
		// Value starting with @@ should be treated as literal @
		// Actually current impl treats any @ as file reference
		// This test documents current behavior - user must use --input for literal @
		expect(() =>
			buildApiRequestBody(baseInput({ field: ["email=@user"] })),
		).toThrow(); // Will fail because @user is not a file
	});
});
