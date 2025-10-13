import { listConfigValues } from "@/src/utils/config";
import { logger } from "@/src/utils/logger";
import { defineCommand } from "@/src/core/define-command";
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

    logger.info("Configuration values:");
    for (const [key, value] of Object.entries(config)) {
      logger.info(`${key}: ${JSON.stringify(value)}`);
    }
    return 0;
  } catch (error) {
    logger.error(
      `Failed to list configuration values: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  }
}

export const configListCommand = defineCommand({
  path: ["config", "list"],
  meta: configListCommandMeta,
  schema: configListCommandSchema,
  handler: runConfigList,
});

export default configListCommand;
