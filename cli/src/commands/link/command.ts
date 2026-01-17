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
	description: "Link a local directory to a CVM",
	stability: "stable",
	arguments: [
		{
			name: "cvm-id",
			description:
				"CVM ID or name to link (optional, interactive if not provided)",
			required: false,
			target: "cvmId",
		},
	],
	options: [jsonOption],
	examples: [
		{
			name: "Link to a CVM by name or ID",
			value: "phala link my-cvm-name",
		},
		{
			name: "Link to an existing CVM interactively",
			value: "phala link",
		},
	],
};

export const linkCommandSchema = z.object({
	cvmId: z.string().optional(),
	json: z.boolean().default(false),
});

export type LinkCommandInput = z.infer<typeof linkCommandSchema>;
