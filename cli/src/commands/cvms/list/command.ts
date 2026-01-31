import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/core/common-flags";

export const cvmsListCommandMeta: CommandMeta = {
	name: "list",
	aliases: ["ls"],
	description: "List CVMs",
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
			name: "List CVMs",
			value: "phala cvms ls",
		},
		{
			name: "Second page",
			value: "phala cvms ls --page 2",
		},
		{
			name: "Output as JSON",
			value: "phala cvms ls --json",
		},
	],
};

export const cvmsListCommandSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(50),
	json: z.boolean().default(false),
});

export type CvmsListCommandInput = z.infer<typeof cvmsListCommandSchema>;
