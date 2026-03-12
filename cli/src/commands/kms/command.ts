import type { CommandGroup } from "@/src/core/types";

export const kmsGroup: CommandGroup = {
	path: ["kms"],
	meta: {
		name: "kms",
		category: "deploy",
		description: "Manage on-chain KMS contracts",
		stability: "unstable",
	},
};
