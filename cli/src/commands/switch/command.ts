import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const switchCommandMeta: CommandMeta = {
	name: "switch",
	category: "profile",
	description: "Switch auth profiles",
	stability: "unstable",
	arguments: [
		{
			name: "profile-name",
			description: "Profile name",
			required: true,
			target: "profileName",
		},
	],
	options: [],
};

export const switchCommandSchema = z.object({
	profileName: z.string().min(1).optional(),
	interactive: z.boolean().default(false),
});

export type SwitchCommandInput = z.infer<typeof switchCommandSchema>;
