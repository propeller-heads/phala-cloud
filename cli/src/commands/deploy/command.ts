import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import {
	DEFAULT_DISK_SIZE,
	DEFAULT_MEMORY,
	DEFAULT_VCPU,
} from "@/src/utils/constants";
import {
	commonAuthOptions,
	cvmIdOption,
	uuidOption,
} from "@/src/core/common-flags";

export const deployCommandMeta: CommandMeta = {
	name: "deploy",
	description: "Create a new CVM with on-chain KMS in one step.",
	arguments: [],
	options: [
		...commonAuthOptions,
		cvmIdOption,
		uuidOption,
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
			name: "instance-type",
			shorthand: "t",
			description:
				"Instance type (e.g., tdx.small, tdx.medium, tdx.large). Optional - auto-selected if not specified.",
			type: "string",
			target: "instanceType",
		},
		{
			name: "vcpu",
			description: `Number of vCPUs (optional, auto-matched if not specified), default is ${DEFAULT_VCPU}`,
			type: "string",
			target: "vcpu",
		},
		{
			name: "memory",
			description: `Memory with optional unit (optional, auto-matched if not specified), e.g., 2G, 1024MB, default is ${DEFAULT_MEMORY}MB`,
			type: "string",
			target: "memory",
		},
		{
			name: "disk-size",
			description: `Disk size with optional unit (optional, auto-matched if not specified), e.g., 50G, 100GB, default is ${DEFAULT_DISK_SIZE}GB`,
			type: "string",
			target: "diskSize",
		},
		{
			name: "image",
			description:
				"OS image version (optional, auto-selected if not specified)",
			type: "string",
			target: "image",
		},
		{
			name: "region",
			shorthand: "r",
			description:
				"Preferred region (e.g., us-west, eu-central). Optional - auto-selected if not specified.",
			type: "string",
			target: "region",
		},
		{
			name: "node-id",
			description: "Node ID (optional, auto-selected if not specified)",
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
		{
			name: "ssh-pubkey",
			description: "Path to SSH public key file (default: ~/.ssh/id_rsa.pub)",
			type: "string",
			target: "sshPubkey",
		},
		{
			name: "dev-os",
			description: "Use development OS image (requires SSH public key)",
			type: "boolean",
			target: "devOs",
		},
		{
			name: "non-dev-os",
			description:
				"Use non-development OS image (SSH public key only if explicitly specified)",
			type: "boolean",
			target: "nonDevOs",
		},
	],
	examples: [
		{
			name: "Deploy with auto-selection (simplest)",
			value: "phala deploy",
		},
		{
			name: "Deploy with specific instance type",
			value: "phala deploy --instance-type tdx.medium",
		},
		{
			name: "Deploy to specific region",
			value: "phala deploy --region us-west",
		},
		{
			name: "Deploy with instance type and region",
			value: "phala deploy --instance-type tdx.small --region eu-central",
		},
		{
			name: "Deploy with manual resource specs",
			value: "phala deploy --vcpu 4 --memory 8G --disk-size 100G",
		},
		{
			name: "Deploy with on-chain KMS",
			value:
				"phala deploy --kms-id ethereum --private-key <key> --rpc-url <url>",
		},
		{
			name: "Deploy to specific node (advanced)",
			value: "phala deploy --node-id 6",
		},
	],
};

export const deployCommandSchema = z.object({
	compose: z.string().optional(),
	json: z.boolean().default(true),
	debug: z.boolean().default(false),
	apiKey: z.string().optional(),
	name: z.string().optional(),
	instanceType: z.string().optional(),
	vcpu: z.string().optional(),
	memory: z.string().optional(),
	diskSize: z.string().optional(),
	image: z.string().optional(),
	region: z.string().optional(),
	nodeId: z.string().optional(),
	envFile: z.string().optional(),
	interactive: z.boolean().default(false),
	kmsId: z.string().optional(),
	cvmId: z.string().optional(),
	customAppId: z.string().optional(),
	preLaunchScript: z.string().optional(),
	privateKey: z.string().optional(),
	rpcUrl: z.string().optional(),
	wait: z.boolean().default(false),
	sshPubkey: z.string().optional(),
	devOs: z.boolean().default(false),
	nonDevOs: z.boolean().default(false),
});

export type DeployCommandInput = z.infer<typeof deployCommandSchema>;
