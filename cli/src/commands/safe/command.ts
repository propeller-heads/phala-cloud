import { z } from "zod";
import type { CommandMeta, CommandGroup } from "@/src/core/types";
import { jsonOption } from "@/src/core/common-flags";

const cvmArgument = {
	name: "cvm",
	description: "CVM identifier (UUID, app_id, instance_id, or name)",
	required: true,
	target: "cvm",
};

export const safeGroup: CommandGroup = {
	path: ["safe"],
	meta: {
		name: "safe",
		description: "Propose transactions to a Safe multisig",
		stability: "unstable",
	},
};

export const safeProposeUpdateMeta: CommandMeta = {
	name: "propose-update",
	description:
		"Compute compose hash and propose addComposeHash to a Safe multisig",
	stability: "unstable",
	arguments: [cvmArgument],
	options: [
		{
			name: "compose",
			shorthand: "c",
			description:
				"Path to new Docker Compose file (default: docker-compose.yml)",
			type: "string",
			target: "compose",
			group: "basic",
		},
		{
			name: "safe-address",
			description: "Safe multisig address",
			type: "string",
			target: "safeAddress",
			group: "basic",
		},
		{
			name: "private-key",
			description:
				"Private key of a Safe signer (proposer). Also reads PRIVATE_KEY env var.",
			type: "string",
			target: "privateKey",
			group: "advanced",
		},
		{
			name: "rpc-url",
			description: "Custom RPC URL for the blockchain",
			type: "string",
			target: "rpcUrl",
			group: "advanced",
		},
		{
			name: "env",
			shorthand: "e",
			description:
				"Environment variable (KEY=VALUE) or env file path (repeatable)",
			type: "string[]",
			target: "env",
			group: "basic",
		},
		{
			name: "pre-launch-script",
			description: "Path to pre-launch script",
			type: "string",
			target: "preLaunchScript",
			group: "advanced",
		},
		{
			name: "safe-api-key",
			description:
				"Safe Transaction Service API key. Also reads SAFE_API_KEY env var.",
			type: "string",
			target: "safeApiKey",
			group: "advanced",
		},
		jsonOption,
	],
	examples: [
		{
			name: "Propose compose update to Safe",
			value:
				"phala safe propose-update app_abc123 -c new-docker-compose.yml --safe-address 0xSafe --private-key 0xKey",
		},
	],
};

export const safeProposeUpdateSchema = z.object({
	cvm: z.string(),
	compose: z.string().optional(),
	safeAddress: z.string(),
	privateKey: z.string().optional(),
	rpcUrl: z.string().optional(),
	env: z.array(z.string()).optional(),
	preLaunchScript: z.string().optional(),
	safeApiKey: z.string().optional(),
	json: z.boolean().default(false),
});

export type SafeProposeUpdateInput = z.infer<typeof safeProposeUpdateSchema>;
