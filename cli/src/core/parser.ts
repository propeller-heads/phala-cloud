import arg from "arg";
import { globalCommandOptions } from "./common-flags";
import { prepareFlagConfig, type PreparedFlagConfig } from "./flags";
import type { CommandOption } from "./types";

export interface ParserOptions {
	readonly permissive?: boolean;
	readonly stopAtPositional?: boolean;
}

export interface ParsedArguments {
	readonly positionals: readonly string[];
	readonly flags: Record<string, unknown>;
	readonly flagConfig: PreparedFlagConfig;
}

export function parseCommandArguments(
	argv: readonly string[],
	commandOptions: readonly CommandOption[] | undefined,
	options: ParserOptions = {},
): ParsedArguments {
	const mergedOptions: CommandOption[] = [
		...globalCommandOptions,
		...(commandOptions ? [...commandOptions] : []),
	];

	const flagConfig = prepareFlagConfig(mergedOptions);

	const { permissive = false, stopAtPositional = false } = options;

	const result = arg(flagConfig.spec, {
		argv: argv as string[],
		permissive,
		stopAtPositional,
	});

	const { _, ...flags } = result;

	return {
		positionals: (_ ?? []) as readonly string[],
		flags,
		flagConfig,
	};
}
