import type { CommandOption } from "./types";

export const helpOption: CommandOption = {
	name: "help",
	shorthand: "h",
	description: "Show help information for the current command",
	type: "boolean",
	target: "help",
};

export const versionOption: CommandOption = {
	name: "version",
	shorthand: "v",
	description: "Show CLI version",
	type: "boolean",
	target: "version",
};

export const interactiveOption: CommandOption = {
	name: "interactive",
	shorthand: "i",
	description: "Enable interactive mode",
	type: "boolean",
	target: "interactive",
};

export const apiTokenOption: CommandOption = {
	name: "api-token",
	description: "API token used for authentication",
	type: "string",
	target: "apiToken",
	aliases: ["api-key"],
	argumentName: "token",
};

export const globalCommandOptions: readonly CommandOption[] = [
	helpOption,
	versionOption,
];

export const commonAuthOptions: readonly CommandOption[] = [apiTokenOption];
