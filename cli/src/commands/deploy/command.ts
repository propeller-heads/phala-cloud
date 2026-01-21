import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import {
	DEFAULT_DISK_SIZE,
	DEFAULT_MEMORY,
	DEFAULT_VCPU,
} from "@/src/utils/constants";
import { cvmIdOption, uuidOption } from "@/src/core/common-flags";

export const deployCommandMeta: CommandMeta = {
	name: "deploy",
	description:
		"Deploy a new CVM or update an existing one. Creates a new CVM by default; updates when --cvm-id is provided or found in phala.toml.",
	stability: "stable",
	arguments: [],
	options: [
		cvmIdOption,
		uuidOption,
		{
			name: "debug",
			description: "Enable debug logging",
			type: "boolean",
			target: "debug",
			group: "advanced",
		},
		{
			name: "name",
			shorthand: "n",
			description:
				"Name of the CVM (optional; default: current directory name, converted to a valid hostname)",
			type: "string",
			target: "name",
			group: "basic",
		},
		{
			name: "compose",
			shorthand: "c",
			description:
				"Path to Docker Compose file (default: docker-compose.yml in current directory)",
			type: "string",
			target: "compose",
			group: "basic",
		},
		{
			name: "instance-type",
			shorthand: "t",
			description:
				"Instance type (e.g., tdx.small, tdx.medium, tdx.large). Optional - auto-selected if not specified.",
			type: "string",
			target: "instanceType",
			group: "basic",
		},
		{
			name: "vcpu",
			description: `[DEPRECATED] Use --instance-type instead. Number of vCPUs, default is ${DEFAULT_VCPU}`,
			type: "string",
			target: "vcpu",
			deprecated: true,
			group: "deprecated",
		},
		{
			name: "memory",
			description: `[DEPRECATED] Use --instance-type instead. Memory with optional unit, e.g., 2G, 1024MB, default is ${DEFAULT_MEMORY}MB`,
			type: "string",
			target: "memory",
			deprecated: true,
			group: "deprecated",
		},
		{
			name: "disk-size",
			description: `Disk size with optional unit (optional, auto-matched if not specified), e.g., 50G, 100GB, default is ${DEFAULT_DISK_SIZE}GB`,
			type: "string",
			target: "diskSize",
			group: "advanced",
		},
		{
			name: "image",
			description:
				"OS image version (optional, auto-selected if not specified)",
			type: "string",
			target: "image",
			group: "advanced",
		},
		{
			name: "region",
			shorthand: "r",
			description:
				"Preferred region (e.g., us-west, eu-central). Optional - auto-selected if not specified.",
			type: "string",
			target: "region",
			group: "basic",
		},
		{
			name: "node-id",
			description: "Node ID (optional, auto-selected if not specified)",
			type: "string",
			target: "nodeId",
			group: "advanced",
		},
		{
			name: "env",
			shorthand: "e",
			description:
				"Environment variable (KEY=VALUE) or path to env file. Can be specified multiple times.",
			type: "string[]",
			target: "env",
			group: "basic",
		},
		{
			name: "env-file",
			description: "[DEPRECATED] Use -e instead. Path to environment file.",
			type: "string",
			target: "envFile",
			deprecated: true,
			group: "deprecated",
		},
		{
			name: "kms",
			description: "KMS type: phala (default), ethereum/eth, or base",
			type: "string",
			target: "kms",
			group: "basic",
		},
		{
			name: "kms-id",
			description: "[DEPRECATED] Use --kms instead. KMS ID to use.",
			type: "string",
			target: "kmsId",
			deprecated: true,
			group: "deprecated",
		},
		{
			name: "custom-app-id",
			description: "Custom App ID to use.",
			type: "string",
			target: "customAppId",
			group: "advanced",
		},
		{
			name: "pre-launch-script",
			description: "Path to pre-launch script",
			type: "string",
			target: "preLaunchScript",
			group: "advanced",
		},
		{
			name: "private-key",
			description: "Private key for signing transactions.",
			type: "string",
			target: "privateKey",
			group: "advanced",
		},
		{
			name: "rpc-url",
			description: "RPC URL for the blockchain.",
			type: "string",
			target: "rpcUrl",
			group: "advanced",
		},
		{
			name: "wait",
			description:
				"Wait for CVM to complete deployment/update before returning (only applies to updates)",
			type: "boolean",
			target: "wait",
			group: "basic",
		},
		{
			name: "ssh-pubkey",
			description: "Path to SSH public key file (default: ~/.ssh/id_rsa.pub)",
			type: "string",
			target: "sshPubkey",
			group: "basic",
		},
		{
			name: "dev-os",
			description: "Use development OS image (requires SSH public key)",
			type: "boolean",
			target: "devOs",
			group: "basic",
		},
		{
			name: "non-dev-os",
			description:
				"Use non-development OS image (SSH public key only if explicitly specified)",
			type: "boolean",
			target: "nonDevOs",
			group: "basic",
		},
		{
			name: "public-logs",
			description:
				"Make CVM logs publicly accessible (default: true for --dev-os, false otherwise)",
			type: "boolean",
			target: "publicLogs",
		},
		{
			name: "public-sysinfo",
			description: "Make CVM system info publicly accessible (default: true)",
			type: "boolean",
			target: "publicSysinfo",
		},
		{
			name: "listed",
			description: "List CVM on the public Trust Center (default: false)",
			type: "boolean",
			target: "listed",
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
			name: "Deploy with on-chain KMS (Ethereum)",
			value: "phala deploy --kms ethereum --private-key <key> --rpc-url <url>",
		},
		// --- Update Existing CVM Examples ---
		{
			name: "Update existing CVM by ID",
			value: "phala deploy --cvm-id app_abc123",
		},
		{
			name: "Update CVM with new compose file and env",
			value:
				"phala deploy --cvm-id my-app --compose ./new-docker-compose.yml -e .env",
		},
		{
			name: "Update CVM and wait for completion",
			value: "phala deploy --cvm-id app_abc123 --wait",
		},
		{
			name: "Update CVM configured in phala.toml (auto-detected)",
			value: "phala deploy",
		},
		// --- Privacy Settings Examples ---
		{
			name: "Deploy with explicit privacy settings",
			value: "phala deploy --public-logs=false --public-sysinfo=false",
		},
		{
			name: "Deploy and list on Trust Center",
			value: "phala deploy --listed",
		},
		{
			name: "Update existing CVM visibility",
			value: "phala deploy --cvm-id app_123 --public-logs=false",
		},
	],
};

export const deployCommandSchema = z.object({
	compose: z.string().optional(),
	json: z.boolean().default(false),
	debug: z.boolean().default(false),
	apiToken: z.string().optional(),
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
	kms: z.enum(["phala", "ethereum", "eth", "base"]).default("phala"),
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
	publicLogs: z.boolean().optional(),
	publicSysinfo: z.boolean().optional(),
	listed: z.boolean().optional(),
});

export type DeployCommandInput = z.infer<typeof deployCommandSchema>;
