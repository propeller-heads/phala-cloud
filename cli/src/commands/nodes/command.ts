import type { CommandGroup } from "@/src/core/types";

export const nodesGroup: CommandGroup = {
	path: ["nodes"],
	meta: {
		name: "nodes",
		description: "List and manage TEE nodes",
	},
};
