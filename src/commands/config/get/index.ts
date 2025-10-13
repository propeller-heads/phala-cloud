import { getConfigValue } from "@/src/utils/config";
import { logger } from "@/src/utils/logger";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import {
  configGetCommandMeta,
  configGetCommandSchema,
  type ConfigGetCommandInput,
} from "./command";

async function runConfigGet(
  input: ConfigGetCommandInput,
  _context: CommandContext,
): Promise<number> {
  try {
    const value = getConfigValue(input.key);

    if (value === undefined) {
      logger.error(`Configuration key '${input.key}' not found`);
      return 1;
    }

    logger.info(`${input.key}: ${JSON.stringify(value)}`);
    return 0;
  } catch (error) {
    logger.error(
      `Failed to get configuration value: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  }
}

export const configGetCommand = defineCommand({
  path: ["config", "get"],
  meta: configGetCommandMeta,
  schema: configGetCommandSchema,
  handler: runConfigGet,
});

export default configGetCommand;
