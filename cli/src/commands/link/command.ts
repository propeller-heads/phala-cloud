import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const jsonOption = {
	name: "json",
	shorthand: "j",
	description: "Output in JSON format",
	type: "boolean" as const,
	target: "json",
	negatedName: "no-json",
};

export const linkCommandMeta: CommandMeta = {
	name: "link",
	category: "manage",
	description: "Link a local directory to a CVM",
	stability: "unstable",
	arguments: [
		{
			name: "cvm-id",
			description: "CVM ID or name (interactive if omitted)",
			required: false,
			target: "cvmId",
		},
	],
	options: [jsonOption],
	examples: [
		{
			name: "Link by name or ID",
			value: "phala link my-cvm-name",
		},
		{
			name: "Link interactively",
			value: "phala link",
		},
	],
};

export const linkCommandSchema = z.object({
	cvmId: z.string().optional(),
	json: z.boolean().default(false),
});

export type LinkCommandInput = z.infer<typeof linkCommandSchema>;
