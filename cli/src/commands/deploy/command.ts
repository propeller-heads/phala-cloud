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
	description:
		"Deploy a new CVM or update an existing one. Creates a new CVM by default; updates when --cvm-id is provided or found in phala.toml.",
	stability: "stable",
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
			description: `[DEPRECATED] Use --instance-type instead. Number of vCPUs, default is ${DEFAULT_VCPU}`,
			type: "string",
			target: "vcpu",
		},
		{
			name: "memory",
			description: `[DEPRECATED] Use --instance-type instead. Memory with optional unit, e.g., 2G, 1024MB, default is ${DEFAULT_MEMORY}MB`,
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
			name: "env",
			shorthand: "e",
			description:
				"Environment variable (KEY=VALUE) or path to env file. Can be specified multiple times.",
			type: "string[]",
			target: "env",
		},
		{
			name: "env-file",
			description: "[DEPRECATED] Use -e instead. Path to environment file.",
			type: "string",
			target: "envFile",
			hidden: true,
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
		// --- New Deployment Examples ---
		{
			name: "Deploy new CVM with auto-selection (simplest)",
			value: "phala deploy",
		},
		{
			name: "Deploy with environment variables",
			value: "phala deploy -e NODE_ENV=production -e DEBUG=true",
		},
		{
			name: "Deploy with env file",
			value: "phala deploy -e .env",
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
			name: "Deploy with on-chain KMS",
			value:
				"phala deploy --kms-id ethereum --private-key <key> --rpc-url <url>",
		},
		// --- Update Existing CVM Examples ---
		{
			name: "Update existing CVM by ID",
			value: "phala deploy --cvm-id app_abc123",
		},
		{
			name: "Update CVM with new compose file and env",
			value: "phala deploy --cvm-id my-app --compose ./new-docker-compose.yml -e .env",
		},
		{
			name: "Update CVM and wait for completion",
			value: "phala deploy --cvm-id app_abc123 --wait",
		},
		{
			name: "Update CVM configured in phala.toml (auto-detected)",
			value: "phala deploy",
		},
	],
};

export const deployCommandSchema = z.object({
	compose: z.string().optional(),
	json: z.boolean().default(false),
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
	env: z.array(z.string()).optional(),
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
