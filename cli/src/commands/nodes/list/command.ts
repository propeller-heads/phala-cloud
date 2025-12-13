import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const nodesListCommandMeta: CommandMeta = {
	name: "list",
	aliases: ["ls"],
	description: "List all available worker nodes",
	stability: "unstable",
	options: [
		{
			name: "json",
			description: "Output in JSON format",
			type: "boolean",
		},
	],
};

export const nodesListCommandSchema = z.object({
	json: z.boolean().optional().default(false),
});

export type NodesListCommandInput = z.infer<typeof nodesListCommandSchema>;
