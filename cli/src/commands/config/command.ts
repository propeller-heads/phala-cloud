import type { CommandGroup } from "@/src/core/types";

export const configGroup: CommandGroup = {
	path: ["config"],
	meta: {
		name: "config",
		description: "Manage your local configuration",
		stability: "stable",
	},
};
