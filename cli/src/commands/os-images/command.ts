import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/core/common-flags";

export const osImagesCommandMeta: CommandMeta = {
	name: "os-images",
	category: "deploy",
	description: "List available OS images",
	stability: "unstable",
	options: [
		{
			name: "dev",
			description: "Show only dev images",
			type: "boolean",
			target: "dev",
			group: "basic",
		},
		{
			name: "prod",
			description: "Show only prod images",
			type: "boolean",
			target: "prod",
			group: "basic",
		},
		jsonOption,
	],
	examples: [
		{
			name: "List all OS images",
			value: "phala os-images",
		},
		{
			name: "List prod images only",
			value: "phala os-images --prod",
		},
		{
			name: "Output as JSON",
			value: "phala os-images --json",
		},
	],
};

export const osImagesCommandSchema = z.object({
	dev: z.boolean().default(false),
	prod: z.boolean().default(false),
	json: z.boolean().default(false),
});

export type OsImagesCommandInput = z.infer<typeof osImagesCommandSchema>;
