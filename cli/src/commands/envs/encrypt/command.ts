import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument, interactiveOption } from "@/src/core/common-flags";

export const envsEncryptCommandMeta: CommandMeta = {
	name: "encrypt",
	description:
		"Encrypt environment variables for a CVM (sealed, only readable inside TEE)",
	stability: "stable",
	arguments: [cvmIdArgument],
	options: [
		interactiveOption,
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
			name: "no-newline",
			shorthand: "n",
			description: "Do not print trailing newline (useful for piping)",
			type: "boolean",
			target: "noNewline",
			group: "basic",
		},
	],
	examples: [
		{
			name: "Encrypt inline variables",
			value: "phala envs encrypt app_abc123 -e SECRET=value -e API_KEY=xxx",
		},
		{
			name: "Encrypt from env file",
			value: "phala envs encrypt app_abc123 -e .env",
		},
		{
			name: "Encrypt with CVM from phala.toml",
			value: "phala envs encrypt -e .env.production",
		},
		{
			name: "Pipe to file for later use",
			value: "phala envs encrypt app_abc123 -e .env > encrypted.hex",
		},
		{
			name: "Pipe without trailing newline",
			value: "phala envs encrypt app_abc123 -n -e .env | some-tool",
		},
	],
};

export const envsEncryptCommandSchema = z.object({
	cvmId: z.string().optional(),
	env: z.array(z.string()).min(1, "At least one -e argument is required"),
	noNewline: z.boolean().default(false),
	interactive: z.boolean().default(false),
});

export type EnvsEncryptCommandInput = z.infer<typeof envsEncryptCommandSchema>;
