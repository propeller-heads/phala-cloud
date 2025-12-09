import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const sshCommandMeta: CommandMeta = {
	name: "ssh",
	description: "Connect to a CVM via SSH",
	arguments: [
		{
			name: "cvm-id",
			description: "CVM ID. If not provided, reads from phala.toml",
			required: false,
			target: "cvmId",
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
			name: "timeout",
			shorthand: "t",
			description: "Connection timeout in seconds (default: 30)",
			type: "string",
			target: "timeout",
		},
		{
			name: "verbose",
			shorthand: "v",
			description: "Show verbose SSH connection details",
			type: "boolean",
			target: "verbose",
		},
		{
			name: "dry-run",
			description: "Print the SSH command without executing it",
			type: "boolean",
			target: "dryRun",
		},
	],
	examples: [
		{
			name: "Connect using configuration from phala.toml",
			value: "phala ssh",
		},
		{
			name: "Connect to a specific CVM (queries API for gateway)",
			value: "phala ssh app_123",
		},
		{
			name: "Offline mode: connect without API (using phala.toml gateway)",
			value: "phala ssh app_123 -g dstack-gateway.example.com -p 16185",
		},
		{
			name: "Connect with custom SSH key",
			value: "phala ssh app_123 -i ~/.ssh/custom_key",
		},
		{
			name: "Connect with verbose output for debugging",
			value: "phala ssh app_123 -v",
		},
		{
			name: "Print the SSH command without executing",
			value: "phala ssh app_123 --dry-run",
		},
	],
};

export const sshCommandSchema = z.object({
	cvmId: z.string().optional(),
	identity: z.string().optional(),
	port: z.string().default("443"),
	gatewayDomain: z.string().optional(),
	timeout: z.string().default("30"),
	verbose: z.boolean().default(false),
	dryRun: z.boolean().default(false),
});

export type SshCommandInput = z.infer<typeof sshCommandSchema>;
