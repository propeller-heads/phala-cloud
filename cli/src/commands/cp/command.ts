import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cpCommandMeta: CommandMeta = {
	name: "cp",
	category: "cvm-ops",
	description: "Copy files to/from a CVM via SCP",
	stability: "unstable",
	arguments: [
		{
			name: "source",
			description:
				"Source path (local or cvm-name:path, use :path for phala.toml cvm_id)",
			required: true,
			target: "source",
		},
		{
			name: "destination",
			description:
				"Destination path (local or cvm-name:path, use :path for phala.toml cvm_id)",
			required: true,
			target: "destination",
		},
	],
	options: [
		{
			name: "identity",
			shorthand: "i",
			description: "SSH identity file (private key)",
			type: "string",
			target: "identity",
		},
		{
			name: "port",
			shorthand: "p",
			description: "SSH port (priority: CLI > phala.toml > 443)",
			type: "string",
			target: "port",
		},
		{
			name: "gateway",
			shorthand: "g",
			description: "Gateway domain (priority: CLI > phala.toml > API)",
			type: "string",
			target: "gatewayDomain",
		},
		{
			name: "recursive",
			shorthand: "r",
			description: "Recursively copy directories",
			type: "boolean",
			target: "recursive",
		},
		{
			name: "verbose",
			shorthand: "v",
			description: "Show verbose SCP details",
			type: "boolean",
			target: "verbose",
		},
		{
			name: "dry-run",
			description: "Print SCP command without executing",
			type: "boolean",
			target: "dryRun",
		},
	],
	examples: [
		{
			name: "Upload from phala.toml",
			value: "phala cp ./local.txt :/root/remote.txt",
		},
		{
			name: "Upload to CVM",
			value: "phala cp ./local.txt app_123:/root/remote.txt",
		},
		{
			name: "Download from CVM",
			value: "phala cp app_123:/root/remote.txt ./local.txt",
		},
		{
			name: "Offline mode",
			value:
				"phala cp -g dstack-pha-prod7.phala.network -p 16185 ./file.txt app_123:/root/",
		},
		{
			name: "Upload directory recursively",
			value: "phala cp -r ./local_dir app_123:/root/remote_dir",
		},
		{
			name: "Copy with custom SSH key",
			value: "phala cp -i ~/.ssh/custom_key app_123:/root/file.txt ./file.txt",
		},
		{
			name: "Print the SCP command without executing",
			value: "phala cp ./local.txt app_123:/root/remote.txt --dry-run",
		},
	],
};

export const cpCommandSchema = z.object({
	source: z.string(),
	destination: z.string(),
	identity: z.string().optional(),
	port: z.string().default("443"),
	gatewayDomain: z.string().optional(),
	recursive: z.boolean().default(false),
	verbose: z.boolean().default(false),
	dryRun: z.boolean().default(false),
});

export type CpCommandInput = z.infer<typeof cpCommandSchema>;
