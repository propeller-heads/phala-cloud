import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument } from "@/src/core/common-flags";

export const cvmsRestartCommandMeta: CommandMeta = {
	name: "restart",
	description: "Restart a CVM",
	arguments: [cvmIdArgument],
	examples: [
		{
			name: "Restart CVM by app_id",
			value: "phala cvms restart app_123",
		},
		{
			name: "Restart CVM by UUID",
			value: "phala cvms restart 550e8400-e29b-41d4-a716-446655440000",
		},
		{
			name: "Restart CVM by name",
			value: "phala cvms restart my-app",
		},
	],
};

export const cvmsRestartCommandSchema = z.object({
	cvmId: z.string().optional(),
});

export type CvmsRestartCommandInput = z.infer<typeof cvmsRestartCommandSchema>;
