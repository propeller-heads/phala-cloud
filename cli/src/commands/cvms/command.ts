import type { CommandGroup } from "@/src/core/types";

export const cvmsGroup: CommandGroup = {
	path: ["cvms"],
	meta: {
		name: "cvms",
		category: "manage",
		description: "Manage CVMs",
		stability: "unstable",
	},
};
