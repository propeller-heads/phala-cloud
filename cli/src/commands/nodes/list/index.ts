import { safeGetAvailableNodes } from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext, CommandMeta } from "@/src/core/types";
import type { AvailableNodesResponse } from "@/src/api/types";
import { getClient } from "@/src/lib/client";
import { logger } from "@/src/utils/logger";
import {
	nodesListCommandMeta,
	nodesListCommandSchema,
	type NodesListCommandInput,
} from "./command";

async function runNodesListCommand(
	_input: NodesListCommandInput,
	_context: CommandContext,
): Promise<number> {
	try {
		const client = await getClient();
		const result = await safeGetAvailableNodes(client);

		if (!result.success) {
			throw new Error(result.error.message);
		}

		const { nodes: teepods, kms_list: kmsList } =
			result.data as AvailableNodesResponse;

		if (!teepods || teepods.length === 0) {
			logger.info("No available nodes found.");
			return 0;
		}

		logger.info("Available Nodes:");
		for (const teepod of teepods) {
			logger.info("----------------------------------------");
			logger.info(`  ID:          ${teepod.teepod_id}`);
			logger.info(`  Name:        ${teepod.name}`);
			logger.info(`  Region:      ${teepod.region_identifier}`);
			logger.info(`  FMSPC:       ${teepod.fmspc || "N/A"}`);
			logger.info(`  Device ID:   ${teepod.device_id || "N/A"}`);
			logger.info(`  Support Onchain KMS: ${teepod.support_onchain_kms}`);
			logger.info("  Images:");
			if (teepod.images && teepod.images.length > 0) {
				for (const img of teepod.images) {
					logger.info(`    - ${img.name}`);
					logger.info(`      Hash: ${img.os_image_hash || "N/A"}`);
				}
			} else {
				logger.info("    N/A");
			}
		}

		if (kmsList && kmsList.length > 0) {
			logger.info("\\nAvailable KMS Instances:");
			for (const kms of kmsList) {
				logger.info("----------------------------------------");
				logger.info(`  Slug:               ${kms.slug}`);
				logger.info(`  URL:                ${kms.url}`);
				logger.info(`  Version:            ${kms.version}`);
				if (kms.chain_id) {
					logger.info(`  Chain ID:           ${kms.chain_id}`);
					logger.info(`  Contract Address:   ${kms.kms_contract_address}`);
					logger.info(`  Gateway App ID:     ${kms.gateway_app_id}`);
				}
			}
		}

		return 0;
	} catch (error) {
		logger.error(
			`Failed to list available nodes: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return 1;
	}
}

const nodesRootCommandMeta: CommandMeta = {
	name: "nodes",
	description: "List and manage TEE nodes",
};

export const nodesListCommand = defineCommand({
	path: ["nodes", "list"],
	meta: nodesListCommandMeta,
	schema: nodesListCommandSchema,
	handler: runNodesListCommand,
});

export const nodesCommand = defineCommand({
	path: ["nodes"],
	meta: nodesRootCommandMeta,
	schema: nodesListCommandSchema,
	handler: runNodesListCommand,
});

export default nodesListCommand;
