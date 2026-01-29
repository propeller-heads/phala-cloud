import { defineCommand } from "@/src/core/define-command";
import { getStateValue } from "@/src/utils/state";
import { logger } from "@/src/utils/logger";

import type { CommandContext } from "@/src/core/types";
import {
	configGetCommandMeta,
	configGetCommandSchema,
	type ConfigGetCommandInput,
} from "./command";

async function runConfigGet(
	input: ConfigGetCommandInput,
	context: CommandContext,
): Promise<number> {
	logger.warn(
		'The "phala config" commands are deprecated and will be removed in a future version.',
	);
	try {
		const value = getStateValue(input.key);

		if (value === undefined) {
			context.stderr.write(`Configuration key '${input.key}' not found\n`);
			return 1;
		}

		context.stdout.write(`${input.key}: ${JSON.stringify(value)}\n`);
		return 0;
	} catch (error) {
		context.stderr.write("Failed to get configuration value\n");
		logger.logDetailedError(error);
		return 1;
	}
}

export const configGetCommand = defineCommand({
	path: ["config", "get"],
	meta: configGetCommandMeta,
	schema: configGetCommandSchema,
	handler: runConfigGet,
});
