import type { CommandGroup } from "@/src/core/types";

export const cvmsGroup: CommandGroup = {
	path: ["cvms"],
	meta: {
		name: "cvms",
		description: "Manage Phala Confidential Virtual Machines (CVMs)",
	},
};
