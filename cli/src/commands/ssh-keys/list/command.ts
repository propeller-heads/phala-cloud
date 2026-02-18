import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const sshKeysListCommandMeta: CommandMeta = {
	name: "list",
	description: "List SSH keys for the current user",
	stability: "stable",
	examples: [
		{
			name: "List all SSH keys",
			value: "phala ssh-keys list",
		},
	],
};

export const sshKeysListCommandSchema = z.object({});

export type SshKeysListCommandInput = z.infer<typeof sshKeysListCommandSchema>;
