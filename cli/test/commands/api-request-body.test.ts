import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	buildApiRequestBody,
	resolveRequest,
} from "../../src/commands/api/index";
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

describe("buildApiRequestBody - -d/--data", () => {
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
});

describe("buildApiRequestBody - -F body fields", () => {
	test("-F with string value (key=value)", () => {
		const result = buildApiRequestBody(
			baseInput({ field: ["name=test", "tag=bar"] }),
		);

		expect(result.body).toEqual({ name: "test", tag: "bar" });
	});

	test("-F with typed JSON value (key:=value)", () => {
		const result = buildApiRequestBody(
			baseInput({ field: ["count:=42", "enabled:=true"] }),
		);

		expect(result.body).toEqual({ count: 42, enabled: true });
	});

	test("-F mixes string and typed JSON values", () => {
		const result = buildApiRequestBody(
			baseInput({ field: ["name=foo", "count:=10", "active:=false"] }),
		);

		expect(result.body).toEqual({ name: "foo", count: 10, active: false });
	});

	test("-F with null and array values", () => {
		const result = buildApiRequestBody(
			baseInput({ field: ["x:=null", 'tags:=["a","b"]'] }),
		);

		expect(result.body).toEqual({ x: null, tags: ["a", "b"] });
	});
});

describe("buildApiRequestBody - mutual exclusion", () => {
	test("errors when -d is used with -F", () => {
		expect(() =>
			buildApiRequestBody(baseInput({ data: ["x"], field: ["a=b"] })),
		).toThrow('"-d/--data" cannot be used with "-F/--field"');
	});

	test("errors when -d is used with --input", () => {
		expect(() =>
			buildApiRequestBody(baseInput({ data: ["x"], input: "data.json" })),
		).toThrow('"-d/--data" cannot be used with "--input"');
	});

	test("errors when --input is used with -F", () => {
		expect(() =>
			buildApiRequestBody(baseInput({ field: ["a=b"], input: "data.json" })),
		).toThrow('"--input" cannot be used with "-F/--field"');
	});

	test("-f (query) does NOT conflict with -d", () => {
		const result = buildApiRequestBody(
			baseInput({ query: ["page=1"], data: ['{"x":1}'] }),
		);
		// -f is ignored by buildApiRequestBody; -d produces body
		expect(result.body).toEqual({ x: 1 });
	});

	test("-f (query) does NOT conflict with -F", () => {
		const result = buildApiRequestBody(
			baseInput({ query: ["page=1"], field: ["name=foo"] }),
		);
		// -f is ignored by buildApiRequestBody; -F produces body
		expect(result.body).toEqual({ name: "foo" });
	});
});

describe("resolveRequest - -f query params", () => {
	test("-f appends query params to endpoint", () => {
		const result = resolveRequest(
			baseInput({ query: ["status=active", "page=2"] }),
			"/cvms",
		);

		expect(result.method).toBe("GET");
		expect(result.endpoint).toBe("/cvms?status=active&page=2");
		expect(result.body).toBeUndefined();
	});

	test("-f appends with & when URL already has query string", () => {
		const result = resolveRequest(
			baseInput({ query: ["page=2"] }),
			"/cvms?sort=name",
		);

		expect(result.endpoint).toBe("/cvms?sort=name&page=2");
	});

	test("-f works with POST method (query params, not body)", () => {
		const result = resolveRequest(
			baseInput({ method: "POST", query: ["page=1"] }),
			"/endpoint",
		);

		expect(result.method).toBe("POST");
		expect(result.endpoint).toBe("/endpoint?page=1");
		expect(result.body).toBeUndefined();
	});

	test("-f combined with -F: query params + body", () => {
		const result = resolveRequest(
			baseInput({
				method: "POST",
				query: ["page=1"],
				field: ["name=foo", "count:=10"],
			}),
			"/endpoint",
		);

		expect(result.method).toBe("POST");
		expect(result.endpoint).toBe("/endpoint?page=1");
		expect(result.body).toEqual({ name: "foo", count: 10 });
	});

	test("-f combined with -d: query params + raw body", () => {
		const result = resolveRequest(
			baseInput({
				method: "POST",
				query: ["page=1"],
				data: ['{"x":1}'],
			}),
			"/endpoint",
		);

		expect(result.method).toBe("POST");
		expect(result.endpoint).toBe("/endpoint?page=1");
		expect(result.body).toEqual({ x: 1 });
	});

	test("no -f: endpoint unchanged", () => {
		const result = resolveRequest(baseInput({}), "/cvms");

		expect(result.endpoint).toBe("/cvms");
		expect(result.body).toBeUndefined();
	});
});

describe("resolveRequest - method preservation", () => {
	test("GET without body stays GET", () => {
		const result = resolveRequest(baseInput({ method: "GET" }), "/test");

		expect(result.method).toBe("GET");
	});

	test("POST with -F body stays POST", () => {
		const result = resolveRequest(
			baseInput({ method: "POST", field: ["x=1"] }),
			"/test",
		);

		expect(result.method).toBe("POST");
		expect(result.body).toEqual({ x: "1" });
	});

	test("PATCH with -d body stays PATCH", () => {
		const result = resolveRequest(
			baseInput({ method: "PATCH", data: ['{"x":1}'] }),
			"/test",
		);

		expect(result.method).toBe("PATCH");
		expect(result.body).toEqual({ x: 1 });
	});
});

describe("@file syntax", () => {
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

	test("-F reads file content as string with =@", () => {
		const result = buildApiRequestBody(
			baseInput({ field: [`content=@${textFile}`] }),
		);

		expect(result.body).toEqual({ content: "Hello from file!" });
	});

	test("-F reads and parses JSON file with :=@", () => {
		const result = buildApiRequestBody(
			baseInput({ field: [`config:=@${jsonFile}`] }),
		);

		expect(result.body).toEqual({
			config: { nested: true, count: 42 },
		});
	});

	test("-F mixes @file with inline values", () => {
		const result = buildApiRequestBody(
			baseInput({
				field: [`readme=@${textFile}`, `settings:=@${jsonFile}`, "name=foo"],
			}),
		);

		expect(result.body).toEqual({
			readme: "Hello from file!",
			settings: { nested: true, count: 42 },
			name: "foo",
		});
	});

	test("-F throws error for invalid JSON file with :=@", () => {
		expect(() =>
			buildApiRequestBody(baseInput({ field: [`bad:=@${invalidJsonFile}`] })),
		).toThrow(/Failed to parse JSON from file/);
	});

	test("-f with nonexistent file throws error", () => {
		expect(() =>
			resolveRequest(
				baseInput({ query: ["x=@/nonexistent/file.txt"] }),
				"/test",
			),
		).toThrow();
	});
});
