import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdArgument, interactiveOption } from "@/src/core/common-flags";
import { jsonOption } from "@/src/commands/status/command";

export const cvmsAttestationCommandMeta: CommandMeta = {
	name: "attestation",
	description: "Get attestation information for a CVM",
	arguments: [cvmIdArgument],
	options: [jsonOption, interactiveOption],
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
	interactive: z.boolean().default(false),
	json: z.boolean().default(false),
});

export type CvmsAttestationCommandInput = z.infer<
	typeof cvmsAttestationCommandSchema
>;
