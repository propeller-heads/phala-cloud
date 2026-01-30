import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import {
	cvmIdArgument,
	cvmIdOption,
	interactiveOption,
	jsonOption,
} from "@/src/core/common-flags";

export const psCommandMeta: CommandMeta = {
	name: "ps",
	description: "List containers of a CVM",
	stability: "stable",
	arguments: [cvmIdArgument],
	options: [cvmIdOption, jsonOption, interactiveOption],
	examples: [
		{
			name: "List containers interactively",
			value: "phala ps",
		},
		{
			name: "List containers by app_id",
			value: "phala ps app_abc123",
		},
		{
			name: "List containers by name",
			value: "phala ps my-app",
		},
		{
			name: "Output as JSON",
			value: "phala ps app_abc123 --json",
		},
	],
};

export const psCommandSchema = z.object({
	cvmId: z.string().optional(),
	json: z.boolean().default(false),
	interactive: z.boolean().default(false),
});

export type PsCommandInput = z.infer<typeof psCommandSchema>;
