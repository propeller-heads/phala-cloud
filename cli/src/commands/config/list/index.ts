import { defineCommand } from "@/src/core/define-command";
import { listStateValues } from "@/src/utils/state";

import { logger } from "@/src/utils/logger";
import type { CommandContext } from "@/src/core/types";
import {
	configListCommandMeta,
	configListCommandSchema,
	type ConfigListCommandInput,
} from "./command";

async function runConfigList(
	input: ConfigListCommandInput,
	context: CommandContext,
): Promise<number> {
	logger.warn(
		'The "phala config" commands are deprecated and will be removed in a future version.',
	);
	try {
		const config = listStateValues();

		if (input.json) {
			context.success(config);
			return 0;
		}

		context.stdout.write("Configuration values:\n");
		for (const [key, value] of Object.entries(config)) {
			context.stdout.write(`${key}: ${JSON.stringify(value)}\n`);
		}
		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail("Failed to list configuration values");
		return 1;
	}
}

export const configListCommand = defineCommand({
	path: ["config", "list"],
	meta: configListCommandMeta,
	schema: configListCommandSchema,
	handler: runConfigList,
});
