import type { CommandGroup } from "@/src/core/types";

export const dockerGroup: CommandGroup = {
	path: ["docker"],
	meta: {
		name: "docker",
		description: "Login to Docker Hub and manage Docker images",
	},
};
