import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument, interactiveOption } from "@/src/core/common-flags";

export const cvmsRestartCommandMeta: CommandMeta = {
	name: "restart",
	description: "Restart a CVM",
	stability: "stable",
	arguments: [cvmIdArgument],
	options: [interactiveOption],
	examples: [
		{
			name: "By app_id",
			value: "phala cvms restart app_123",
		},
		{
			name: "By UUID",
			value: "phala cvms restart 550e8400-e29b-41d4-a716-446655440000",
		},
		{
			name: "By name",
			value: "phala cvms restart my-app",
		},
	],
};

export const cvmsRestartCommandSchema = z.object({
	cvmId: z.string().optional(),
	interactive: z.boolean().default(false),
});

export type CvmsRestartCommandInput = z.infer<typeof cvmsRestartCommandSchema>;
