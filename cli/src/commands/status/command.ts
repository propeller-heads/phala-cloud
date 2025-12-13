import { z } from "zod";
import { commonAuthOptions } from "@/src/core/common-flags";
import type { CommandMeta } from "@/src/core/types";

export const jsonOption = {
	name: "json",
	shorthand: "j",
	description: "Output in JSON format",
	type: "boolean" as const,
	target: "json",
	negatedName: "no-json",
};

export const debugOption = {
	name: "debug",
	shorthand: "d",
	description: "Enable debug output",
	type: "boolean" as const,
	target: "debug",
};

export const statusCommandMeta: CommandMeta = {
	name: "status",
	description: "Check Phala Cloud status and authentication",
	stability: "stable",
	options: [...commonAuthOptions, jsonOption, debugOption],
	examples: [
		{
			name: "Show login status in human-readable format",
			value: "phala status",
		},
		{
			name: "Get status as JSON",
			value: "phala status --json",
		},
	],
};

export const statusCommandSchema = z.object({
	json: z.boolean().default(false),
	debug: z.boolean().default(false),
	apiToken: z.string().optional(),
});

export type StatusCommandInput = z.infer<typeof statusCommandSchema>;
