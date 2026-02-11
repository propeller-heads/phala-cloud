import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument } from "@/src/core/common-flags";

export const sshCommandMeta: CommandMeta = {
	name: "ssh",
	category: "cvm-ops",
	description: "Connect to a CVM via SSH",
	stability: "unstable",
	arguments: [cvmIdArgument],
	options: [
		{
			name: "port",
			shorthand: "p",
			description: "Gateway port (priority: CLI > phala.toml > 443)",
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
			name: "timeout",
			shorthand: "t",
			description: "Connection timeout in seconds (default: 30)",
			type: "string",
			target: "timeout",
		},
		{
			name: "verbose",
			shorthand: "v",
			description: "Show verbose connection details",
			type: "boolean",
			target: "verbose",
		},
		{
			name: "dry-run",
			description: "Print SSH command without executing",
			type: "boolean",
			target: "dryRun",
		},
	],
	passThrough: {
		description:
			"All arguments after -- are passed directly to ssh. Common options: -i (identity file), -L (local forward), -R (remote forward), -D (SOCKS proxy), -N (no command), -v (ssh verbose). Any trailing arguments are executed as remote command. Note: -o ProxyCommand is blocked.",
		examples: [
			"-- -L 8080:localhost:80",
			"-- -i ~/.ssh/key -D 1080 -N",
			"-- ls -la /app",
		],
	},
	examples: [
		{
			name: "Connect from phala.toml",
			value: "phala ssh",
		},
		{
			name: "Connect to CVM",
			value: "phala ssh app_123",
		},
		{
			name: "Offline mode",
			value: "phala ssh app_123 -g dstack-pha-prod7.phala.network -p 16185",
		},
		{
			name: "Connect with custom SSH key",
			value: "phala ssh app_123 -- -i ~/.ssh/custom_key",
		},
		{
			name: "Forward local port 8080 to remote port 80",
			value: "phala ssh app_123 -- -L 8080:localhost:80",
		},
		{
			name: "SOCKS proxy without remote command",
			value: "phala ssh app_123 -- -D 1080 -N",
		},
		{
			name: "Execute remote command",
			value: "phala ssh app_123 -- ls -la /app",
		},
		{
			name: "Connect with verbose output for debugging",
			value: "phala ssh app_123 -v",
		},
		{
			name: "Print the SSH command without executing",
			value: "phala ssh app_123 --dry-run -- -L 8080:localhost:80",
		},
	],
};

export const sshCommandSchema = z.object({
	cvmId: z.string().optional(),
	port: z.string().default("443"),
	gatewayDomain: z.string().optional(),
	timeout: z.string().default("30"),
	verbose: z.boolean().default(false),
	dryRun: z.boolean().default(false),
	"--": z.array(z.string()).optional(),
});

export type SshCommandInput = z.infer<typeof sshCommandSchema>;
