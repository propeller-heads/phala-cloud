import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const configSetCommandMeta: CommandMeta = {
	name: "set",
	description: "Set a configuration value",
	stability: "stable",
	arguments: [
		{
			name: "key",
			description: "Configuration key",
			required: true,
		},
		{
			name: "value",
			description: "Configuration value",
			required: true,
		},
	],
};

export const configSetCommandSchema = z.object({
	key: z.string(),
	value: z.string(),
});

export type ConfigSetCommandInput = z.infer<typeof configSetCommandSchema>;
