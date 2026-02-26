import { z } from "zod";
import { interactiveOption } from "@/src/core/common-flags";
import type { CommandArgument, CommandMeta } from "@/src/core/types";

const keyIdArgument: CommandArgument = {
	name: "key_id",
	description: "SSH key ID to remove (from `phala ssh-keys list`)",
	required: false,
	target: "keyId",
};

export const sshKeysRemoveCommandMeta: CommandMeta = {
	name: "remove",
	aliases: ["rm"],
	description: "Remove an SSH key from your account",
	stability: "stable",
	arguments: [keyIdArgument],
	options: [interactiveOption],
	examples: [
		{
			name: "Remove an SSH key by ID",
			value: "phala ssh-keys remove sshkey_xxx",
		},
		{
			name: "Interactive selection",
			value: "phala ssh-keys rm -i",
		},
	],
};

export const sshKeysRemoveCommandSchema = z.object({
	keyId: z.string().optional(),
	interactive: z.boolean().default(false),
});

export type SshKeysRemoveCommandInput = z.infer<
	typeof sshKeysRemoveCommandSchema
>;
