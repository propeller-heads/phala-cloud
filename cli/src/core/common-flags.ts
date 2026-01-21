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
	group: "basic",
};

export const apiTokenOption: CommandOption = {
	name: "api-token",
	description: "API token used for authentication",
	type: "string",
	target: "apiToken",
	aliases: ["api-key"],
	argumentName: "token",
	group: "basic",
};

export const jsonOption: CommandOption = {
	name: "json",
	shorthand: "j",
	description: "Output in JSON format",
	type: "boolean",
	target: "json",
	negatedName: "no-json",
	group: "basic",
};

export const globalCommandOptions: readonly CommandOption[] = [
	helpOption,
	versionOption,
	apiTokenOption,
	jsonOption,
	interactiveOption,
];

export const commonAuthOptions: readonly CommandOption[] = [apiTokenOption];

/**
 * CVM ID argument (positional)
 * Supports all identifier formats: UUID, app_id, instance_id, name
 */
export const cvmIdArgument = {
	name: "cvm_id",
	description: "CVM identifier (UUID, app_id, instance_id, or name)",
	required: false,
	target: "cvmId",
};

/**
 * CVM ID option (--cvm-id)
 * Primary option for CVM identifier
 */
export const cvmIdOption: CommandOption = {
	name: "cvm-id",
	description: "CVM identifier (UUID, app_id, instance_id, or name)",
	type: "string",
	target: "cvmId",
};

/**
 * UUID option (--uuid) - DEPRECATED
 * Kept for backward compatibility, maps to cvmId
 */
export const uuidOption: CommandOption = {
	name: "uuid",
	description: "[DEPRECATED] Use --cvm-id instead. CVM UUID.",
	type: "string",
	target: "cvmId",
	deprecated: true,
	group: "deprecated",
};
