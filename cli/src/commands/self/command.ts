import type { CommandGroup } from "@/src/core/types";

export const selfGroup: CommandGroup = {
	path: ["self"],
	meta: {
		name: "self",
		category: "advanced",
		description: "CLI self-management",
		stability: "unstable",
	},
};
