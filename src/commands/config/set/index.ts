import { setConfigValue } from "@/src/utils/config";
import { logger } from "@/src/utils/logger";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import {
  configSetCommandMeta,
  configSetCommandSchema,
  type ConfigSetCommandInput,
} from "./command";

function parseValue(rawValue: string): unknown {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return rawValue;
  }

  if (
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed === "true" ||
    trimmed === "false" ||
    !Number.isNaN(Number(trimmed))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return rawValue;
    }
  }

  return rawValue;
}

async function runConfigSet(
  input: ConfigSetCommandInput,
  _context: CommandContext,
): Promise<number> {
  try {
    const parsedValue = parseValue(input.value);
    setConfigValue(input.key, parsedValue);
    logger.success(`Configuration value for '${input.key}' set successfully`);
    return 0;
  } catch (error) {
    logger.error(
      `Failed to set configuration value: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  }
}

export const configSetCommand = defineCommand({
  path: ["config", "set"],
  meta: configSetCommandMeta,
  schema: configSetCommandSchema,
  handler: runConfigSet,
});

export default configSetCommand;
