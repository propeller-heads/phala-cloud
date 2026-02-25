import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { formatCommandHelp } from "./help";
import type { CommandDefinition } from "./types";
import { CommandRegistry } from "./registry";

describe("formatCommandHelp", () => {
	test("should group options by basic/advanced/deprecated", () => {
		const definition: CommandDefinition = {
			path: ["demo"],
			meta: {
				name: "demo",
				description: "Demo command",
				stability: "stable",
				options: [
					{ name: "basic", type: "string", group: "basic" },
					{ name: "advanced", type: "string", group: "advanced" },
					{
						name: "legacy",
						type: "string",
						description: "[DEPRECATED] legacy option",
					},
				],
			},
			schema: z.object({}),
			run: () => undefined,
		};

		const registry = new CommandRegistry();
		registry.registerCommand(definition);
		const text = formatCommandHelp({
			executableName: "phala",
			definition,
			registry,
		});

		expect(text).toContain("Basic options:");
		expect(text).toContain("--basic <value>");

		expect(text).toContain("Advanced options:");
		expect(text).toContain("--advanced <value>");

		expect(text).toContain("Deprecated options:");
		expect(text).toContain("--legacy <value>");
	});

	test("should omit global shorthand when it conflicts with command option shorthand", () => {
		const definition: CommandDefinition = {
			path: ["demo-conflict"],
			meta: {
				name: "demo-conflict",
				description: "Demo command (shorthand conflict)",
				stability: "stable",
				options: [{ name: "jot", shorthand: "j", type: "boolean" }],
			},
			schema: z.object({}),
			run: () => undefined,
		};

		const registry = new CommandRegistry();
		registry.registerCommand(definition);
		const text = formatCommandHelp({
			executableName: "phala",
			definition,
			registry,
		});

		expect(text).toContain("Global options:");
		expect(text).toContain("--json");
		expect(text).not.toContain("-j, --json");

		expect(text).toContain("Basic options:");
		expect(text).toContain("-j, --jot");
	});
});
