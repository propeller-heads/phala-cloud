import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import {
	DEFAULT_DISK_SIZE,
	DEFAULT_MEMORY,
	DEFAULT_VCPU,
} from "@/src/utils/constants";
import { commonAuthOptions } from "@/src/core/common-flags";

export const deployCommandMeta: CommandMeta = {
	name: "deploy",
	description: "Create a new CVM with on-chain KMS in one step.",
	arguments: [],
	options: [
		...commonAuthOptions,
		{
			name: "json",
			description: "Output in JSON format",
			type: "boolean",
			target: "json",
			negatedName: "no-json",
		},
		{
			name: "debug",
			description: "Enable debug logging",
			type: "boolean",
			target: "debug",
		},
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
			description:
				"Path to Docker Compose file (default: docker-compose.yml in current directory)",
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
			description: `Memory with optional unit (e.g., 2G, 1024MB), default is ${DEFAULT_MEMORY}MB`,
			type: "string",
			target: "memory",
		},
		{
			name: "disk-size",
			description: `Disk size with optional unit (e.g., 50G, 100GB), default is ${DEFAULT_DISK_SIZE}GB`,
			type: "string",
			target: "diskSize",
		},
		{
			name: "image",
			description: "Version of dstack image to use",
			type: "string",
			target: "image",
		},
		{
			name: "node-id",
			description: "Node ID to use",
			type: "string",
			target: "nodeId",
		},
		{
			name: "env-file",
			shorthand: "e",
			description:
				"Prompt for environment variables and save to file (optional)",
			type: "string",
			target: "envFile",
		},
		{
			name: "interactive",
			shorthand: "i",
			description: "Enable interactive mode for required parameters",
			type: "boolean",
			target: "interactive",
		},
		{
			name: "kms-id",
			description: "KMS ID to use.",
			type: "string",
			target: "kmsId",
		},
		{
			name: "uuid",
			description: "UUID of the CVM to upgrade",
			type: "string",
			target: "uuid",
		},
		{
			name: "custom-app-id",
			description: "Custom App ID to use.",
			type: "string",
			target: "customAppId",
		},
		{
			name: "pre-launch-script",
			description: "Path to pre-launch script",
			type: "string",
			target: "preLaunchScript",
		},
		{
			name: "private-key",
			description: "Private key for signing transactions.",
			type: "string",
			target: "privateKey",
		},
		{
			name: "rpc-url",
			description: "RPC URL for the blockchain.",
			type: "string",
			target: "rpcUrl",
		},
		{
			name: "wait",
			description:
				"Wait for CVM to complete deployment/update before returning (only applies to updates)",
			type: "boolean",
			target: "wait",
		},
	],
	examples: [
		{
			name: "Deploy with docker-compose.yml in current directory",
			value: "phala deploy",
		},
		{
			name: "Deploy with specific compose file",
			value: "phala deploy -c docker-compose.yml",
		},
		{
			name: "Deploy with interactive mode",
			value: "phala deploy --interactive",
		},
		{
			name: "Deploy to specific node with KMS",
			value:
				"phala deploy -c docker-compose.yml --node-id 6 --kms-id t16z-dev --private-key <key> --rpc-url <url>",
		},
	],
};

export const deployCommandSchema = z.object({
	compose: z.string().optional(),
	json: z.boolean().default(true),
	debug: z.boolean().default(false),
	apiKey: z.string().optional(),
	name: z.string().optional(),
	vcpu: z.string().optional(),
	memory: z.string().optional(),
	diskSize: z.string().optional(),
	image: z.string().optional(),
	nodeId: z.string().optional(),
	envFile: z.string().optional(),
	interactive: z.boolean().default(false),
	kmsId: z.string().optional(),
	uuid: z.string().optional(),
	customAppId: z.string().optional(),
	preLaunchScript: z.string().optional(),
	privateKey: z.string().optional(),
	rpcUrl: z.string().optional(),
	wait: z.boolean().default(false),
});

export type DeployCommandInput = z.infer<typeof deployCommandSchema>;
