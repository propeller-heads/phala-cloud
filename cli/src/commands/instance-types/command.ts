import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/core/common-flags";

export const instanceTypesCommandMeta: CommandMeta = {
	name: "instance-types",
	category: "deploy",
	description: "List available instance types",
	stability: "unstable",
	arguments: [
		{
			name: "family",
			description: "Instance type family (cpu, gpu)",
			required: false,
			target: "family",
		},
	],
	options: [jsonOption],
	examples: [
		{
			name: "List all instance type families",
			value: "phala instance-types",
		},
		{
			name: "List CPU instance types",
			value: "phala instance-types cpu",
		},
		{
			name: "List GPU instance types",
			value: "phala instance-types gpu",
		},
		{
			name: "Output as JSON",
			value: "phala instance-types --json",
		},
	],
};

export const instanceTypesCommandSchema = z.object({
	family: z.string().optional(),
	json: z.boolean().default(false),
});

export type InstanceTypesCommandInput = z.infer<
	typeof instanceTypesCommandSchema
>;
