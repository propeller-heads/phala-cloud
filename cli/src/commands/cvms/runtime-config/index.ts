import { safeGetCvmUserConfig } from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getClient } from "@/src/lib/client";
import { logger } from "@/src/utils/logger";
import {
	cvmsRuntimeConfigCommandMeta,
	cvmsRuntimeConfigCommandSchema,
	type CvmsRuntimeConfigCommandInput,
} from "./command";

async function runCvmsRuntimeConfigCommand(
	_input: CvmsRuntimeConfigCommandInput,
	context: CommandContext,
): Promise<number> {
	if (!context.cvmId) {
		context.fail(
			"No CVM ID provided. Either pass a CVM ID as argument or configure it in phala.toml.",
		);
		return 1;
	}

	try {
		const client = await getClient();
		const result = await safeGetCvmUserConfig(client, context.cvmId);

		if (!result.success) {
			logger.error(`Failed to get runtime config: ${result.error.message}`);
			return 1;
		}

		const config = result.data;

		logger.info(`Hostname:       ${config.hostname ?? "-"}`);
		logger.info(`Gateway Domain: ${config.default_gateway_domain ?? "-"}`);
		logger.info(
			`SSH Keys:       ${config.ssh_authorized_keys.length > 0 ? `${config.ssh_authorized_keys.length} key(s)` : "none"}`,
		);

		if (config.ssh_authorized_keys.length > 0) {
			logger.break();
			logger.info("SSH Authorized Keys:");
			for (const key of config.ssh_authorized_keys) {
				const parts = key.split(" ");
				const keyType = parts[0] ?? "";
				const keyComment = parts[2] ?? "";
				logger.info(`  ${keyType} ...${keyComment ? ` ${keyComment}` : ""}`);
			}
		}

		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail("Failed to get CVM runtime config");
		return 1;
	}
}

export const cvmsRuntimeConfigCommand = defineCommand({
	path: ["cvms", "runtime-config"],
	meta: cvmsRuntimeConfigCommandMeta,
	schema: cvmsRuntimeConfigCommandSchema,
	handler: runCvmsRuntimeConfigCommand,
});

export default cvmsRuntimeConfigCommand;
