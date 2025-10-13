import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cvmsResizeCommandMeta: CommandMeta = {
	name: "resize",
	description: "Resize resources for a CVM",
	arguments: [
		{
			name: "app-id",
			description: "App ID of the CVM (optional)",
			required: false,
			target: "appId",
		},
	],
	options: [
		{
			name: "vcpu",
			shorthand: "v",
			description: "Number of virtual CPUs",
			type: "string",
			target: "vcpu",
		},
		{
			name: "memory",
			shorthand: "m",
			description: "Memory size in MB",
			type: "string",
			target: "memory",
		},
		{
			name: "disk-size",
			shorthand: "d",
			description: "Disk size in GB",
			type: "string",
			target: "diskSize",
		},
		{
			name: "allow-restart",
			shorthand: "r",
			description: "Allow restart of the CVM if needed for resizing",
			type: "string",
			target: "allowRestart",
		},
		{
			name: "yes",
			shorthand: "y",
			description: "Automatically confirm the resize operation",
			type: "boolean",
			target: "yes",
		},
	],
	examples: [
		{
			name: "Resize CVM interactively",
			value: "phala cvms resize",
		},
		{
			name: "Resize without confirmation",
			value:
				"phala cvms resize app_123 --vcpu 4 --memory 4096 --disk-size 120 --yes",
		},
	],
};

export const cvmsResizeCommandSchema = z.object({
	appId: z.string().optional(),
	vcpu: z.string().optional(),
	memory: z.string().optional(),
	diskSize: z.string().optional(),
	allowRestart: z.string().optional(),
	yes: z.boolean().default(false),
});

export type CvmsResizeCommandInput = z.infer<typeof cvmsResizeCommandSchema>;
