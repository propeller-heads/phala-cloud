import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const configGetCommandMeta: CommandMeta = {
	name: "get",
	description: "Get a configuration value",
	arguments: [
		{
			name: "key",
			description: "Configuration key",
			required: true,
		},
	],
};

export const configGetCommandSchema = z.object({
	key: z.string(),
});

export type ConfigGetCommandInput = z.infer<typeof configGetCommandSchema>;
