import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cvmsStartCommandMeta: CommandMeta = {
	name: "start",
	description: "Start a stopped CVM",
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
			name: "Start a specific CVM",
			value: "phala cvms start app_123",
		},
	],
};

export const cvmsStartCommandSchema = z.object({
	appId: z.string().optional(),
});

export type CvmsStartCommandInput = z.infer<typeof cvmsStartCommandSchema>;
