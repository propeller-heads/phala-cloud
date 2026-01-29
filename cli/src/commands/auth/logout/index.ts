import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { loadCredentialsFile, removeProfile } from "@/src/utils/credentials";

import { logger } from "@/src/utils/logger";
import {
	logoutCommandMeta,
	logoutCommandSchema,
	type LogoutCommandInput,
} from "./command";

async function runLogoutCommand(
	_input: LogoutCommandInput,
	_context: CommandContext,
): Promise<number> {
	// Show deprecation warning
	logger.warn(
		'The "phala auth logout" command is deprecated and will be removed in a future version.',
	);
	logger.info('Please use "phala logout" instead.');
	logger.break();

	try {
		const current = loadCredentialsFile();
		const profile = current?.current_profile;
		removeProfile();
		logger.success(
			profile
				? `Credentials removed successfully (profile: ${profile})`
				: "Credentials removed successfully",
		);
		return 0;
	} catch (error) {
		logger.error("Failed to remove credentials");
		logger.logDetailedError(error);
		return 1;
	}
}

export const logoutCommand = defineCommand({
	path: ["auth", "logout"],
	meta: logoutCommandMeta,
	schema: logoutCommandSchema,
	handler: runLogoutCommand,
});

export default logoutCommand;
