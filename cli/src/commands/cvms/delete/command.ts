import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument } from "@/src/core/common-flags";

export const cvmsDeleteCommandMeta: CommandMeta = {
	name: "delete",
	description: "Delete a CVM",
	arguments: [cvmIdArgument],
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
			name: "Delete CVM by app_id",
			value: "phala cvms delete app_123 --force",
		},
		{
			name: "Delete CVM by UUID",
			value: "phala cvms delete 550e8400-e29b-41d4-a716-446655440000 -f",
		},
		{
			name: "Delete CVM by name",
			value: "phala cvms delete my-app --yes",
		},
	],
};

export const cvmsDeleteCommandSchema = z.object({
	cvmId: z.string().optional(),
	force: z.boolean().default(false),
	yes: z.boolean().default(false),
});

export type CvmsDeleteCommandInput = z.infer<typeof cvmsDeleteCommandSchema>;
