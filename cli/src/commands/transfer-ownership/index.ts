import {
	safeTransferOwnership,
	type TransferOwnership,
} from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { logger } from "@/src/utils/logger";
import {
	resolveAppContract,
	resolvePrivateKey,
	txExplorerUrl,
} from "@/src/utils/onchain";
import {
	transferOwnershipMeta,
	transferOwnershipSchema,
	type TransferOwnershipInput,
} from "./command";

async function handler(
	input: TransferOwnershipInput,
	context: CommandContext,
): Promise<number> {
	try {
		if (!input.newOwner) {
			context.fail("--new-owner is required.");
			return 1;
		}

		const resolved = await resolveAppContract(input.cvm, context);
		if (!resolved) return 1;

		const { chain, appContractAddress } = resolved;
		const privateKey = resolvePrivateKey(input);

		logger.info(
			`Transferring ownership of ${appContractAddress} on ${chain.name}...`,
		);

		const result = await safeTransferOwnership({
			chain,
			rpcUrl: input.rpcUrl,
			appAddress: appContractAddress,
			newOwner: input.newOwner as `0x${string}`,
			privateKey,
			skipPrerequisiteChecks: true,
		});

		if (!result.success) {
			const err = result as { success: false; error: { message: string } };
			context.fail(err.error.message);
			return 1;
		}

		const data = result.data as TransferOwnership;
		const explorerUrl = txExplorerUrl(chain, data.transactionHash);

		if (input.json) {
			context.success({
				previousOwner: data.previousOwner,
				newOwner: data.newOwner,
				transactionHash: data.transactionHash,
				blockNumber: data.blockNumber?.toString(),
				explorer: explorerUrl ?? undefined,
			});
			return 0;
		}

		logger.success("Ownership transferred successfully!");
		logger.info(`Previous owner: ${data.previousOwner}`);
		logger.info(`New owner:      ${data.newOwner}`);
		logger.info(`Transaction:    ${data.transactionHash}`);
		if (explorerUrl) {
			logger.info(`Explorer:       ${explorerUrl}`);
		}

		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

export const transferOwnershipCommand = defineCommand({
	path: ["transfer-ownership"],
	meta: transferOwnershipMeta,
	schema: transferOwnershipSchema,
	handler,
});
