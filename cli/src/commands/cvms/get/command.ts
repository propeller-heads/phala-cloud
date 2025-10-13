import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/commands/status/command";

export const cvmsGetCommandMeta: CommandMeta = {
	name: "get",
	description: "Get details of a CVM",
	arguments: [
		{
			name: "app-id",
			description: "App ID of the CVM (optional)",
			required: false,
			target: "appId",
		},
	],
	options: [jsonOption],
	examples: [
		{
			name: "Show CVM details interactively",
			value: "phala cvms get",
		},
		{
			name: "Get CVM info for a specific App ID",
			value: "phala cvms get app_123",
		},
	],
};

export const cvmsGetCommandSchema = z.object({
	appId: z.string().optional(),
	json: z.boolean().default(false),
});

export type CvmsGetCommandInput = z.infer<typeof cvmsGetCommandSchema>;
