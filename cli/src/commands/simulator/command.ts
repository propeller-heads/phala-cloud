import type { CommandGroup } from "@/src/core/types";

export const simulatorGroup: CommandGroup = {
	path: ["simulator"],
	meta: {
		name: "simulator",
		category: "manage",
		description: "TEE simulator commands",
		stability: "unstable",
	},
};
