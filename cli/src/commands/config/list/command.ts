import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const configListCommandMeta: CommandMeta = {
	name: "list",
	aliases: ["ls"],
	description: "List all configuration values",
	stability: "stable",
	options: [
		{
			name: "json",
			shorthand: "j",
			description: "Output in JSON format",
			type: "boolean",
			target: "json",
		},
	],
};

export const configListCommandSchema = z.object({
	json: z.boolean().default(false),
});

export type ConfigListCommandInput = z.infer<typeof configListCommandSchema>;
