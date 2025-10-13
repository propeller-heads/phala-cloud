import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cvmsRestartCommandMeta: CommandMeta = {
	name: "restart",
	description: "Restart a CVM",
	arguments: [
		{
			name: "app-id",
			description: "App ID of the CVM (optional)",
			required: false,
			target: "appId",
		},
	],
	examples: [
		{
			name: "Restart a specific CVM",
			value: "phala cvms restart app_123",
		},
	],
};

export const cvmsRestartCommandSchema = z.object({
	appId: z.string().optional(),
});

export type CvmsRestartCommandInput = z.infer<typeof cvmsRestartCommandSchema>;
