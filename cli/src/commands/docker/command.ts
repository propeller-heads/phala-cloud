import type { CommandGroup } from "@/src/core/types";

export const dockerGroup: CommandGroup = {
	path: ["docker"],
	meta: {
		name: "docker",
		description: "Docker Hub login and image management",
		stability: "deprecated",
	},
};
