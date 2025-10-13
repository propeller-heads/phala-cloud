import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cvmsStopCommandMeta: CommandMeta = {
	name: "stop",
	description: "Stop a running CVM",
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
			name: "Stop a specific CVM",
			value: "phala cvms stop app_123",
		},
	],
};

export const cvmsStopCommandSchema = z.object({
	appId: z.string().optional(),
});

export type CvmsStopCommandInput = z.infer<typeof cvmsStopCommandSchema>;
