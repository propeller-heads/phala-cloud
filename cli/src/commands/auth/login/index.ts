import chalk from "chalk";

import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { runLoginCommand as newRunLoginCommand } from "@/src/commands/login";

import { loginCommandMeta, loginCommandSchema } from "./command";
import type { LoginCommandInput } from "./command";

async function runDeprecatedLoginCommand(
	input: LoginCommandInput,
	context: CommandContext,
): Promise<number> {
	// Show deprecation warning
	console.warn(
		chalk.yellow(
			"Warning: 'phala auth login' is deprecated. Please use 'phala login' instead.",
		),
	);
	console.warn();

	// Delegate to new login command
	return await newRunLoginCommand(input, context);
}

export const loginCommand = defineCommand({
	path: ["auth", "login"],
	meta: loginCommandMeta,
	schema: loginCommandSchema,
	handler: runDeprecatedLoginCommand,
});

export default loginCommand;
