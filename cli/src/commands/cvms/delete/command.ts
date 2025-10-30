import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cvmsDeleteCommandMeta: CommandMeta = {
	name: "delete",
	description: "Delete a CVM",
	arguments: [
		{
			name: "app-id",
			description: "App ID of the CVM (leave empty for interactive selection)",
			required: false,
			target: "appId",
		},
	],
	options: [
		{
			name: "force",
			shorthand: "f",
			description: "Skip confirmation prompt",
			type: "boolean",
			target: "force",
		},
		{
			name: "yes",
			shorthand: "y",
			description: "Alias for --force (skip confirmation prompt)",
			type: "boolean",
			target: "yes",
		},
	],
	examples: [
		{
			name: "Delete a CVM interactively",
			value: "phala cvms delete",
		},
		{
			name: "Delete a CVM without confirmation",
			value: "phala cvms delete app_123 --force",
		},
	],
};

export const cvmsDeleteCommandSchema = z.object({
	appId: z.string().optional(),
	force: z.boolean().default(false),
	yes: z.boolean().default(false),
});

export type CvmsDeleteCommandInput = z.infer<typeof cvmsDeleteCommandSchema>;
