import { safeGetCurrentUser } from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getClientWithAuth, type CliApiClient } from "@/src/lib/client";

import { logger, setJsonMode } from "@/src/utils/logger";
import { statusCommandMeta, statusCommandSchema } from "./command";
import type { StatusCommandInput } from "./command";

export async function runStatusCommand(
	input: StatusCommandInput,
	context: CommandContext,
): Promise<number | undefined> {
	setJsonMode(input.json);

	const debug = input.debug || context.env.DEBUG?.toLowerCase() === "true";

	const { client, auth } = await getClientWithAuth(context, {
		apiToken: input.apiToken,
	});

	if (!auth.apiKey) {
		logger.warn('Not authenticated. Please set an API key with "phala login"');
		return 0;
	}

	if (debug) {
		logger.debug(
			`Using API key: ${auth.apiKey.substring(0, 5)}... (source=${auth.tokenSource}, profile=${auth.profileName})`,
		);
		logger.debug(
			`Using API prefix: ${auth.baseURL} (source=${auth.apiPrefixSource})`,
		);
	}

	try {
		const result = await safeGetCurrentUser(client);

		if (!result.success) {
			logger.error("Failed to get user information");
			if (result.error) {
				logger.error(`Error: ${result.error.message}`);
			}
			context.fail(result.error?.message || "Failed to get user information");
			return 1;
		}

		const userInfo = result.data;
		const apiUrl = auth.baseURL;

		const apiVersion = client.config.version;

		if (input.json) {
			context.success({
				apiUrl,
				apiVersion,
				username: userInfo.user.username,
				team_name: userInfo.workspace.name,
				profile: auth.profileName,
			});
			return 0;
		}

		context.stdout.write(`Integrated API: ${apiUrl}\n`);
		context.stdout.write(`API Version: ${apiVersion}\n`);
		context.stdout.write(`Logged in as: ${userInfo.user.username}\n`);
		context.stdout.write(`Current Workspace: ${userInfo.workspace.name}\n`);
		context.stdout.write(`Current Profile: ${auth.profileName}\n`);
		return 0;
	} catch (error) {
		logger.error(
			"Authentication failed. Your API key may be invalid or expired.",
		);
		logger.info('Please set a new API key with "phala login"');

		if (debug) {
			logger.logDetailedError(error);
		}
		context.fail(
			"Authentication failed. Your API key may be invalid or expired.",
		);
		return 1;
	}
}

export const statusCommand = defineCommand({
	path: ["status"],
	meta: statusCommandMeta,
	schema: statusCommandSchema,
	handler: runStatusCommand,
});

export default statusCommand;
