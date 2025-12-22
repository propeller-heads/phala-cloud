import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument, interactiveOption } from "@/src/core/common-flags";

export const cvmsStartCommandMeta: CommandMeta = {
	name: "start",
	description: "Start a stopped CVM",
	stability: "stable",
	arguments: [cvmIdArgument],
	options: [interactiveOption],
	examples: [
		{
			name: "Start CVM by app_id",
			value: "phala cvms start app_123",
		},
		{
			name: "Start CVM by UUID",
			value: "phala cvms start 550e8400-e29b-41d4-a716-446655440000",
		},
		{
			name: "Start CVM by name",
			value: "phala cvms start my-app",
		},
	],
};

export const cvmsStartCommandSchema = z.object({
	cvmId: z.string().optional(),
	interactive: z.boolean().default(false),
});

export type CvmsStartCommandInput = z.infer<typeof cvmsStartCommandSchema>;
