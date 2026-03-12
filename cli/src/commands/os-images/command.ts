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
		{
			name: "page",
			description: "Page number (1-indexed)",
			type: "number",
			target: "page",
			group: "basic",
		},
		{
			name: "page-size",
			description: "Items per page (max 100)",
			type: "number",
			target: "pageSize",
			group: "basic",
		},
		{
			name: "all",
			description: "Fetch all pages",
			type: "boolean",
			target: "all",
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
			name: "List page 2 with page size 20",
			value: "phala os-images --page 2 --page-size 20",
		},
		{
			name: "Fetch all pages",
			value: "phala os-images --all",
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
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(100),
	all: z.boolean().default(false),
	json: z.boolean().default(false),
});

export type OsImagesCommandInput = z.infer<typeof osImagesCommandSchema>;
