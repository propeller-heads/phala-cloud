import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import {
	DEFAULT_DISK_SIZE,
	DEFAULT_MEMORY,
	DEFAULT_VCPU,
} from "@/src/utils/constants";

export const cvmsCreateCommandMeta: CommandMeta = {
	name: "create",
	description: 'Create a new CVM (use "phala deploy" instead)',
	stability: "deprecated",
	options: [
		{
			name: "name",
			shorthand: "n",
			description: "Name of the CVM",
			type: "string",
			target: "name",
		},
		{
			name: "compose",
			shorthand: "c",
			description: "Path to Docker Compose file",
			type: "string",
			target: "compose",
		},
		{
			name: "vcpu",
			description: `Virtual CPUs (default: ${DEFAULT_VCPU})`,
			type: "string",
			target: "vcpu",
		},
		{
			name: "memory",
			description: `Memory in MB (default: ${DEFAULT_MEMORY})`,
			type: "string",
			target: "memory",
		},
		{
			name: "disk-size",
			description: `Disk size in GB (default: ${DEFAULT_DISK_SIZE})`,
			type: "string",
			target: "diskSize",
		},
		{
			name: "teepod-id",
			description: "TEEPod ID (auto-selected if omitted)",
			type: "string",
			target: "teepodId",
		},
		{
			name: "image",
			description: "dstack image version (uses default if omitted)",
			type: "string",
			target: "image",
		},
		{
			name: "env-file",
			shorthand: "e",
			description: "Path to environment file",
			type: "string",
			target: "envFile",
		},
		{
			name: "skip-env",
			description: "Skip env var prompt",
			type: "boolean",
			target: "skipEnv",
		},
		{
			name: "debug",
			description: "Enable debug output",
			type: "boolean",
			target: "debug",
		},
	],
	examples: [
		{
			name: "Create a CVM interactively",
			value: "phala cvms create",
		},
		{
			name: "Create using predefined values",
			value: "phala cvms create --name demo --compose ./docker-compose.yml",
		},
	],
};

export const cvmsCreateCommandSchema = z.object({
	name: z.string().optional(),
	compose: z.string().optional(),
	vcpu: z.string().optional(),
	memory: z.string().optional(),
	diskSize: z.string().optional(),
	teepodId: z.string().optional(),
	image: z.string().optional(),
	envFile: z.string().optional(),
	skipEnv: z.boolean().default(false),
	debug: z.boolean().default(false),
});

export type CvmsCreateCommandInput = z.infer<typeof cvmsCreateCommandSchema>;
