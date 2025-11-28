import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument } from "@/src/core/common-flags";
import { jsonOption } from "@/src/commands/status/command";

export const cvmsAttestationCommandMeta: CommandMeta = {
	name: "attestation",
	description: "Get attestation information for a CVM",
	arguments: [cvmIdArgument],
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
	cvmId: z.string().optional(),
	json: z.boolean().default(false),
});

export type CvmsAttestationCommandInput = z.infer<
	typeof cvmsAttestationCommandSchema
>;
