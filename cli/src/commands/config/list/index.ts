import { defineCommand } from "@/src/core/define-command";
import { listConfigValues } from "@/src/utils/config";
import { logDetailedError } from "@/src/utils/error-handling";
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
	try {
		const config = listConfigValues();

		if (input.json) {
			context.stdout.write(`${JSON.stringify(config, null, 2)}\n`);
			return 0;
		}

		context.stdout.write("Configuration values:\n");
		for (const [key, value] of Object.entries(config)) {
			context.stdout.write(`${key}: ${JSON.stringify(value)}\n`);
		}
		return 0;
	} catch (error) {
		context.stderr.write("Failed to list configuration values\n");
		logDetailedError(error);
		return 1;
	}
}

export const configListCommand = defineCommand({
	path: ["config", "list"],
	meta: configListCommandMeta,
	schema: configListCommandSchema,
	handler: runConfigList,
});
