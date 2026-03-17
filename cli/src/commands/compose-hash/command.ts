import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/core/common-flags";

const cvmArgument = {
	name: "cvm",
	description: "CVM identifier (UUID, app_id, instance_id, or name)",
	required: true,
	target: "cvm",
};

export const composeHashMeta: CommandMeta = {
	name: "compose-hash",
	description:
		"Compute the compose hash for a CVM update",
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
			name: "pre-launch-script",
			description: "Path to pre-launch script",
			type: "string",
			target: "preLaunchScript",
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
		jsonOption,
	],
	examples: [
		{
			name: "Get compose hash for a new compose file",
			value: "phala compose-hash app_abc123 -c new-docker-compose.yml",
		},
		{
			name: "Get compose hash with environment variables",
			value: "phala compose-hash app_abc123 -c docker-compose.yml -e .env",
		},
	],
};

export const composeHashSchema = z.object({
	cvm: z.string(),
	compose: z.string().optional(),
	preLaunchScript: z.string().optional(),
	env: z.array(z.string()).optional(),
	json: z.boolean().default(false),
});

export type ComposeHashInput = z.infer<typeof composeHashSchema>;
