import type { CommandGroup } from "@/src/core/types";

export const envsGroup: CommandGroup = {
	path: ["envs"],
	meta: {
		name: "envs",
		category: "manage",
		description: "Encrypt and update CVM sealed environment variables",
		stability: "stable",
	},
};
