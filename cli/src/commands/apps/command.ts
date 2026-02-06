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
		{
			name: "search",
			description: "Search by name, app_id, vm_uuid, or instance_id",
			type: "string",
			target: "search",
			group: "basic",
		},
		{
			name: "status",
			description: "Filter by CVM status (can be specified multiple times)",
			type: "string[]",
			target: "status",
			group: "basic",
		},
		{
			name: "listed",
			description: "Filter by listed status",
			type: "boolean",
			target: "listed",
			negatedName: "no-listed",
			group: "basic",
		},
		{
			name: "base-image",
			description: "Filter by base image name",
			type: "string",
			target: "baseImage",
			group: "basic",
		},
		{
			name: "instance-type",
			description: "Filter by instance type",
			type: "string",
			target: "instanceType",
			group: "basic",
		},
		{
			name: "kms-type",
			description: "Filter by KMS type",
			type: "string",
			target: "kmsType",
			group: "basic",
		},
		{
			name: "node",
			description: "Filter by node name",
			type: "string",
			target: "node",
			group: "basic",
		},
		{
			name: "region",
			description: "Filter by region identifier",
			type: "string",
			target: "region",
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
			name: "Search by name",
			value: "phala apps --search my-app",
		},
		{
			name: "Filter by status",
			value: "phala apps --status running",
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
	search: z.string().optional(),
	status: z.array(z.string()).optional(),
	listed: z.boolean().optional(),
	baseImage: z.string().optional(),
	instanceType: z.string().optional(),
	kmsType: z.string().optional(),
	node: z.string().optional(),
	region: z.string().optional(),
	json: z.boolean().default(false),
});

export type AppsCommandInput = z.infer<typeof appsCommandSchema>;
