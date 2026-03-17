import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { jsonOption } from "@/src/core/common-flags";

const cvmArgument = {
	name: "cvm",
	description: "CVM identifier (UUID, app_id, instance_id, or name)",
	required: true,
	target: "cvm",
};

export const transferOwnershipMeta: CommandMeta = {
	name: "transfer-ownership",
	description:
		"Transfer ownership of a CVM's on-chain DstackApp contract to a new address",
	stability: "unstable",
	arguments: [cvmArgument],
	options: [
		{
			name: "new-owner",
			description: "New owner address",
			type: "string",
			target: "newOwner",
		},
		{
			name: "private-key",
			description: "Current owner's private key for signing the transaction",
			type: "string",
			target: "privateKey",
			group: "advanced",
		},
		{
			name: "rpc-url",
			description: "Custom RPC URL for the blockchain",
			type: "string",
			target: "rpcUrl",
			group: "advanced",
		},
		jsonOption,
	],
	examples: [
		{
			name: "Transfer ownership to a new address",
			value:
				"phala transfer-ownership app_abc123 --new-owner 0xNewAddress --private-key 0x...",
		},
	],
};

export const transferOwnershipSchema = z.object({
	cvm: z.string(),
	newOwner: z.string(),
	privateKey: z.string().optional(),
	rpcUrl: z.string().optional(),
	json: z.boolean().default(false),
});

export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;
