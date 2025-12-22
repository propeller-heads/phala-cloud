import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument, interactiveOption } from "@/src/core/common-flags";

export const cvmsStopCommandMeta: CommandMeta = {
	name: "stop",
	description: "Stop a running CVM",
	stability: "stable",
	arguments: [cvmIdArgument],
	options: [interactiveOption],
	examples: [
		{
			name: "Stop CVM by app_id",
			value: "phala cvms stop app_123",
		},
		{
			name: "Stop CVM by UUID",
			value: "phala cvms stop 550e8400-e29b-41d4-a716-446655440000",
		},
		{
			name: "Stop CVM by name",
			value: "phala cvms stop my-app",
		},
	],
};

export const cvmsStopCommandSchema = z.object({
	cvmId: z.string().optional(),
	interactive: z.boolean().default(false),
});

export type CvmsStopCommandInput = z.infer<typeof cvmsStopCommandSchema>;
