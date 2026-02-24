import { z } from "zod";
import type { CommandArgument, CommandMeta } from "@/src/core/types";

const keyIdArgument: CommandArgument = {
	name: "key_id",
	description: "SSH key ID to remove (from `phala ssh-keys list`)",
	required: true,
	target: "keyId",
};

export const sshKeysRemoveCommandMeta: CommandMeta = {
	name: "remove",
	aliases: ["rm"],
	description: "Remove an SSH key from your account",
	stability: "stable",
	arguments: [keyIdArgument],
	examples: [
		{
			name: "Remove an SSH key by ID",
			value: "phala ssh-keys remove sshkey_xxx",
		},
	],
};

export const sshKeysRemoveCommandSchema = z.object({
	keyId: z.string(),
});

export type SshKeysRemoveCommandInput = z.infer<
	typeof sshKeysRemoveCommandSchema
>;
