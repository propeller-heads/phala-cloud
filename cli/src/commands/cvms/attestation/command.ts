import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/commands/status/command";

export const cvmsAttestationCommandMeta: CommandMeta = {
	name: "attestation",
	description: "Get attestation information for a CVM",
	arguments: [
		{
			name: "app-id",
			description: "CVM app ID (prompts if not provided)",
			required: false,
			target: "appId",
		},
	],
	options: [jsonOption],
	examples: [
		{
			name: "Show attestation summary",
			value: "phala cvms attestation",
		},
		{
			name: "Output full attestation JSON",
			value: "phala cvms attestation --json",
		},
	],
};

export const cvmsAttestationCommandSchema = z.object({
	appId: z.string().optional(),
	json: z.boolean().default(false),
});

export type CvmsAttestationCommandInput = z.infer<
	typeof cvmsAttestationCommandSchema
>;
