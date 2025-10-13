import { z } from "zod";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext, CommandMeta } from "@/src/core/types";
import { configGroup } from "./command";
import { configGetCommand } from "./get";
import { configListCommand } from "./list";
import { configSetCommand } from "./set";

const configRootMeta: CommandMeta = {
  name: "config",
  description: "Manage your local configuration",
};

const configRootSchema = z.object({});

async function runConfigRoot(
  _input: z.infer<typeof configRootSchema>,
  context: CommandContext,
): Promise<number> {
  context.stdout.write(
    "Available config subcommands: get, set, list. Use 'phala config <command> --help' for details.\\n",
  );
  return 0;
}

export const configRootCommand = defineCommand({
  path: ["config"],
  meta: configRootMeta,
  schema: configRootSchema,
  handler: runConfigRoot,
});

export const configCommands = {
  group: configGroup,
  commands: [configRootCommand, configGetCommand, configSetCommand, configListCommand],
};

export default configCommands;
