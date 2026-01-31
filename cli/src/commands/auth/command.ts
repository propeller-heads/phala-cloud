import type { CommandGroup } from "@/src/core/types";

export const authGroup: CommandGroup = {
	path: ["auth"],
	meta: {
		name: "auth",
		category: "deprecated",
		description: "Authenticate with Phala Cloud",
		stability: "deprecated",
	},
};
