import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/core/common-flags";

export const kmsChainCommandMeta = (chain: string): CommandMeta => ({
	name: chain,
	description: `Show on-chain KMS details for ${chain}`,
	stability: "unstable",
	options: [jsonOption],
	examples: [
		{
			name: `Show ${chain} KMS details`,
			value: `phala kms ${chain}`,
		},
		{
			name: "Output as JSON",
			value: `phala kms ${chain} --json`,
		},
	],
});

export const kmsChainCommandSchema = z.object({
	json: z.boolean().default(false),
});

export type KmsChainCommandInput = z.infer<typeof kmsChainCommandSchema>;
