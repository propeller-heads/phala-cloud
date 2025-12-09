import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cpCommandMeta: CommandMeta = {
	name: "cp",
	description: "Copy files to/from a CVM via SCP",
	arguments: [
		{
			name: "source",
			description:
				"Source path. Local file or remote in format 'cvm-id:path'. Use ':path' to read cvm_id from phala.toml",
			required: true,
			target: "source",
		},
		{
			name: "destination",
			description:
				"Destination path. Local file or remote in format 'cvm-id:path'. Use ':path' to read cvm_id from phala.toml",
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
			description:
				"SSH port. Priority: CLI option > phala.toml gateway_port > 443",
			type: "string",
			target: "port",
		},
		{
			name: "gateway-domain",
			shorthand: "g",
			description:
				"Gateway domain. Priority: CLI option > phala.toml gateway_domain > API. When specified, skips API call for offline usage",
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
			description: "Print the SCP command without executing it",
			type: "boolean",
			target: "dryRun",
		},
	],
	examples: [
		{
			name: "Upload using phala.toml cvm_id",
			value: "phala cp ./local.txt :/root/remote.txt",
		},
		{
			name: "Upload to a specific CVM (queries API for gateway)",
			value: "phala cp ./local.txt app_123:/root/remote.txt",
		},
		{
			name: "Download from CVM",
			value: "phala cp app_123:/root/remote.txt ./local.txt",
		},
		{
			name: "Offline mode: copy without API (using phala.toml gateway)",
			value:
				"phala cp -g dstack-gateway.example.com -p 16185 ./file.txt app_123:/root/",
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
