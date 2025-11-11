import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { runStatusCommand } from "@/src/commands/status";
import type { StatusCommandInput } from "@/src/commands/status/command";
import { logger } from "@/src/utils/logger";
import { authStatusCommandMeta, authStatusCommandSchema } from "./command";

export const authStatusCommand = defineCommand({
	path: ["auth", "status"],
	meta: authStatusCommandMeta,
	schema: authStatusCommandSchema,
	handler: async (input: StatusCommandInput, context: CommandContext) => {
		// Show deprecation warning (unless in JSON mode)
		if (!input.json) {
			logger.warn(
				'The "phala auth status" command is deprecated and will be removed in a future version.',
			);
			logger.info('Please use "phala status" instead.');
			logger.break();
		}
		return runStatusCommand(input, context);
	},
});

export default authStatusCommand;
