import { z } from "zod";
import type { CommandMeta, CommandOption } from "@/src/core/types";

const nameOption: CommandOption = {
	name: "name",
	description: "Name for the SSH key (default: key file name)",
	type: "string",
	target: "name",
};

const keyFileOption: CommandOption = {
	name: "key-file",
	description:
		"Path to SSH public key file (default: ~/.ssh/id_ed25519.pub or ~/.ssh/id_rsa.pub)",
	type: "string",
	target: "keyFile",
};

export const sshKeysAddCommandMeta: CommandMeta = {
	name: "add",
	description: "Add a local SSH public key to your account",
	stability: "stable",
	options: [nameOption, keyFileOption],
	examples: [
		{
			name: "Add default SSH key",
			value: "phala ssh-keys add",
		},
		{
			name: "Add a specific key with a name",
			value:
				"phala ssh-keys add --name my-laptop --key-file ~/.ssh/id_ed25519.pub",
		},
	],
};

export const sshKeysAddCommandSchema = z.object({
	name: z.string().optional(),
	keyFile: z.string().optional(),
});

export type SshKeysAddCommandInput = z.infer<typeof sshKeysAddCommandSchema>;
