import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const switchCommandMeta: CommandMeta = {
	name: "switch",
	description: "Switch between authentication profiles",
	stability: "unstable",
	arguments: [
		{
			name: "profile-name",
			description: "Name of the profile to switch to",
			required: true,
			target: "profileName",
		},
	],
	options: [
		{
			name: "list",
			shorthand: "l",
			description: "List available profiles",
			type: "boolean",
			target: "list",
		},
	],
};

export const switchCommandSchema = z.object({
	profileName: z.string().min(1).optional(),
	list: z.boolean().default(false),
	interactive: z.boolean().default(false),
});

export type SwitchCommandInput = z.infer<typeof switchCommandSchema>;
