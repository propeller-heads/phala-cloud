import type { CommandGroup } from "@/src/core/types";

export const sshKeysGroup: CommandGroup = {
	path: ["ssh-keys"],
	meta: {
		name: "ssh-keys",
		category: "manage",
		description: "Manage SSH keys",
		stability: "stable",
	},
};
