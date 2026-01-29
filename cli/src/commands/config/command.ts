import type { CommandGroup } from "@/src/core/types";

export const configGroup: CommandGroup = {
	path: ["config"],
	meta: {
		name: "config",
		description:
			"[DEPRECATED] Manage local CLI state (will be removed in a future version)",
		stability: "deprecated",
	},
};
