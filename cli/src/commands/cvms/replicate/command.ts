import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument, interactiveOption } from "@/src/core/common-flags";

export const cvmsReplicateCommandMeta: CommandMeta = {
	name: "replicate",
	description: "Create a replica of an existing CVM",
	stability: "unstable",
	arguments: [cvmIdArgument],
	options: [
		{
			name: "teepod-id",
			description: "TEEPod ID for replica",
			type: "string",
			target: "teepodId",
		},
		{
			name: "env-file",
			shorthand: "e",
			description: "Path to environment file",
			type: "string",
			target: "envFile",
		},
		interactiveOption,
	],
	examples: [
		{
			name: "Replicate a CVM",
			value: "phala cvms replicate 1234 --teepod-id 5",
		},
	],
};

export const cvmsReplicateCommandSchema = z.object({
	cvmId: z.string().optional(),
	teepodId: z.string().optional(),
	envFile: z.string().optional(),
	interactive: z.boolean().default(false),
});

export type CvmsReplicateCommandInput = z.infer<
	typeof cvmsReplicateCommandSchema
>;
