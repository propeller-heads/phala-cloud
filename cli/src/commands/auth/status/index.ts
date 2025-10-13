import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { runStatusCommand } from "@/src/commands/status";
import type { StatusCommandInput } from "@/src/commands/status/command";
import { authStatusCommandMeta, authStatusCommandSchema } from "./command";

export const authStatusCommand = defineCommand({
	path: ["auth", "status"],
	meta: authStatusCommandMeta,
	schema: authStatusCommandSchema,
	handler: (input: StatusCommandInput, context: CommandContext) =>
		runStatusCommand(input, context),
});

export default authStatusCommand;
