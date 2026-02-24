import { safeDeleteSshKey } from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getClient } from "@/src/lib/client";
import { logger } from "@/src/utils/logger";
import {
	sshKeysRemoveCommandMeta,
	sshKeysRemoveCommandSchema,
	type SshKeysRemoveCommandInput,
} from "./command";

async function runSshKeysRemoveCommand(
	input: SshKeysRemoveCommandInput,
	context: CommandContext,
): Promise<number> {
	try {
		const client = await getClient();
		const result = await safeDeleteSshKey(client, { keyId: input.keyId });

		if (!result.success) {
			context.fail(`Failed to remove SSH key: ${result.error.message}`);
			return 1;
		}

		logger.success(`SSH key ${input.keyId} removed`);
		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail("Failed to remove SSH key");
		return 1;
	}
}

export const sshKeysRemoveCommand = defineCommand({
	path: ["ssh-keys", "remove"],
	meta: sshKeysRemoveCommandMeta,
	schema: sshKeysRemoveCommandSchema,
	handler: runSshKeysRemoveCommand,
});

export default sshKeysRemoveCommand;
