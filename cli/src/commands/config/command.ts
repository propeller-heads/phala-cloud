import type { CommandGroup } from "@/src/core/types";

export const configGroup: CommandGroup = {
	path: ["config"],
	meta: {
		name: "config",
		category: "deprecated",
		description: "Manage local CLI state",
		stability: "deprecated",
	},
};
