import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import {
	DEFAULT_DISK_SIZE,
	DEFAULT_MEMORY,
	DEFAULT_VCPU,
} from "@/src/utils/constants";

export const cvmsCreateCommandMeta: CommandMeta = {
	name: "create",
	description: '[DEPRECATED] Create a new CVM (use "phala deploy" instead)',
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
			description: `Number of vCPUs, default is ${DEFAULT_VCPU}`,
			type: "string",
			target: "vcpu",
		},
		{
			name: "memory",
			description: `Memory in MB, default is ${DEFAULT_MEMORY}`,
			type: "string",
			target: "memory",
		},
		{
			name: "disk-size",
			description: `Disk size in GB, default is ${DEFAULT_DISK_SIZE}`,
			type: "string",
			target: "diskSize",
		},
		{
			name: "teepod-id",
			description:
				"TEEPod ID to use. If not provided, it will be selected automatically.",
			type: "string",
			target: "teepodId",
		},
		{
			name: "image",
			description:
				"Version of dstack image to use. If not provided, a default image is used.",
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
			description: "Skip environment variable prompt",
			type: "boolean",
			target: "skipEnv",
		},
		{
			name: "debug",
			description: "Enable debug mode",
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
