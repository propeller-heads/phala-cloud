import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument, interactiveOption } from "@/src/core/common-flags";
import { jsonOption } from "@/src/commands/status/command";

export const cvmsGetCommandMeta: CommandMeta = {
	name: "get",
	description: "Get details of a CVM",
	arguments: [cvmIdArgument],
	options: [jsonOption, interactiveOption],
	examples: [
		{
			name: "Show CVM details interactively",
			value: "phala cvms get",
		},
		{
			name: "Get CVM by app_id",
			value: "phala cvms get app_abc123",
		},
		{
			name: "Get CVM by UUID",
			value: "phala cvms get 550e8400-e29b-41d4-a716-446655440000",
		},
		{
			name: "Get CVM by name",
			value: "phala cvms get my-app",
		},
	],
};

export const cvmsGetCommandSchema = z.object({
	cvmId: z.string().optional(),
	json: z.boolean().default(false),
	interactive: z.boolean().default(false),
});

export type CvmsGetCommandInput = z.infer<typeof cvmsGetCommandSchema>;
