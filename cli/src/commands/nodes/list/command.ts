import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/core/common-flags";

export const nodesListCommandMeta: CommandMeta = {
	name: "list",
	aliases: ["ls"],
	description: "List workspace nodes",
	stability: "unstable",
	options: [
		{
			name: "page",
			description: "Page number (1-based)",
			type: "number",
			target: "page",
			group: "basic",
		},
		{
			name: "page-size",
			description: "Number of items per page",
			type: "number",
			target: "pageSize",
			group: "basic",
		},
		jsonOption,
	],
	examples: [
		{
			name: "List nodes (page 1)",
			value: "phala nodes list",
		},
		{
			name: "List nodes (page 2)",
			value: "phala nodes list --page 2",
		},
		{
			name: "Output as JSON",
			value: "phala nodes list --json",
		},
	],
};

export const nodesListCommandSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(30),
	json: z.boolean().default(false),
});

export type NodesListCommandInput = z.infer<typeof nodesListCommandSchema>;
