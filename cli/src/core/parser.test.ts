import { describe, expect, test } from "bun:test";
import { parseCommandArguments } from "./parser";

describe("parseCommandArguments", () => {
	describe("pass-through argument splitting (--)", () => {
		test("should return empty passThrough when no -- separator", () => {
			const result = parseCommandArguments(
				["--foo", "bar", "positional"],
				[{ name: "foo", type: "string" }],
			);
			expect(result.passThrough).toEqual([]);
			expect(result.flags["--foo"]).toBe("bar");
			expect(result.positionals).toEqual(["positional"]);
		});

		test("should split arguments at -- separator", () => {
			const result = parseCommandArguments(
				["--foo", "bar", "--", "-L", "8080:localhost:80"],
				[{ name: "foo", type: "string" }],
			);
			expect(result.flags["--foo"]).toBe("bar");
			expect(result.passThrough).toEqual(["-L", "8080:localhost:80"]);
			expect(result.positionals).toEqual([]);
		});

		test("should handle positional before -- and pass-through after", () => {
			const result = parseCommandArguments(
				["app_123", "--foo", "bar", "--", "-i", "~/.ssh/key", "ls", "-la"],
				[{ name: "foo", type: "string" }],
			);
			expect(result.positionals).toEqual(["app_123"]);
			expect(result.flags["--foo"]).toBe("bar");
			expect(result.passThrough).toEqual(["-i", "~/.ssh/key", "ls", "-la"]);
		});

		test("should handle -- at the beginning", () => {
			const result = parseCommandArguments(
				["--", "-L", "8080:localhost:80"],
				[{ name: "foo", type: "string" }],
			);
			expect(result.passThrough).toEqual(["-L", "8080:localhost:80"]);
			expect(result.positionals).toEqual([]);
		});

		test("should handle -- at the end with nothing after", () => {
			const result = parseCommandArguments(
				["--foo", "bar", "--"],
				[{ name: "foo", type: "string" }],
			);
			expect(result.flags["--foo"]).toBe("bar");
			expect(result.passThrough).toEqual([]);
		});

		test("should handle -- with only positionals before", () => {
			const result = parseCommandArguments(
				["app_123", "--", "ls", "-la", "/app"],
				[],
			);
			expect(result.positionals).toEqual(["app_123"]);
			expect(result.passThrough).toEqual(["ls", "-la", "/app"]);
		});

		test("should preserve options that look like flags in pass-through", () => {
			const result = parseCommandArguments(
				["--verbose", "--", "-v", "-o", "StrictHostKeyChecking=no"],
				[{ name: "verbose", type: "boolean" }],
			);
			expect(result.flags["--verbose"]).toBe(true);
			expect(result.passThrough).toEqual([
				"-v",
				"-o",
				"StrictHostKeyChecking=no",
			]);
		});

		test("should only split on first -- separator", () => {
			const result = parseCommandArguments(
				["--foo", "bar", "--", "echo", "--", "hello"],
				[{ name: "foo", type: "string" }],
			);
			expect(result.flags["--foo"]).toBe("bar");
			// Everything after first -- goes to passThrough, including the second --
			expect(result.passThrough).toEqual(["echo", "--", "hello"]);
		});
	});
});
