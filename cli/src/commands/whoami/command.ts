import { z } from "zod";
import { commonAuthOptions } from "@/src/core/common-flags";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/commands/status/command";

export const whoamiCommandMeta: CommandMeta = {
	name: "whoami",
	category: "profile",
	description: "Print the current user",
	stability: "stable",
	options: [...commonAuthOptions, jsonOption],
	examples: [
		{
			name: "Show current user",
			value: "phala whoami",
		},
		{
			name: "JSON output",
			value: "phala whoami --json",
		},
	],
};

export const whoamiCommandSchema = z.object({
	json: z.boolean().default(false),
	apiToken: z.string().optional(),
});

export type WhoamiCommandInput = z.infer<typeof whoamiCommandSchema>;
