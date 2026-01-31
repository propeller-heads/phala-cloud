import type { CommandGroup } from "@/src/core/types";

export const nodesGroup: CommandGroup = {
	path: ["nodes"],
	meta: {
		name: "nodes",
		category: "deploy",
		description: "Manage TEE nodes",
		stability: "unstable",
	},
};
