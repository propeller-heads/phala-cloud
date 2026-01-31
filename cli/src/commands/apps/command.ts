import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/core/common-flags";

export const appsCommandMeta: CommandMeta = {
	name: "apps",
	category: "manage",
	description: "List dstack apps",
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
			name: "List apps",
			value: "phala apps",
		},
		{
			name: "Second page",
			value: "phala apps --page 2",
		},
		{
			name: "Output as JSON",
			value: "phala apps --json",
		},
	],
};

export const appsCommandSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(50),
	json: z.boolean().default(false),
});

export type AppsCommandInput = z.infer<typeof appsCommandSchema>;
