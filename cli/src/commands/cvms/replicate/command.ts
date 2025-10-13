import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cvmsReplicateCommandMeta: CommandMeta = {
	name: "replicate",
	description: "Create a replica of an existing CVM",
	arguments: [
		{
			name: "cvm-id",
			description: "UUID of the CVM to replicate",
			required: true,
			target: "cvmId",
		},
	],
	options: [
		{
			name: "teepod-id",
			description: "TEEPod ID to use for the replica",
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
	],
	examples: [
		{
			name: "Replicate a CVM",
			value: "phala cvms replicate 1234 --teepod-id 5",
		},
	],
};

export const cvmsReplicateCommandSchema = z.object({
	cvmId: z.string().min(1, "CVM ID is required"),
	teepodId: z.string().optional(),
	envFile: z.string().optional(),
});

export type CvmsReplicateCommandInput = z.infer<
	typeof cvmsReplicateCommandSchema
>;
