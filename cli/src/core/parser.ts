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
	/** Arguments after -- separator, for pass-through to subprocesses */
	readonly passThrough: readonly string[];
}

/**
 * Split argv at the -- separator
 * Returns [beforeDash, afterDash]
 */
function splitAtDoubleDash(argv: readonly string[]): [string[], string[]] {
	const dashIndex = argv.indexOf("--");
	if (dashIndex === -1) {
		return [[...argv], []];
	}
	return [argv.slice(0, dashIndex), argv.slice(dashIndex + 1)];
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

	// Split argv at -- to handle pass-through arguments
	const [mainArgv, passThrough] = splitAtDoubleDash(argv);

	const result = arg(flagConfig.spec, {
		argv: mainArgv,
		permissive,
		stopAtPositional,
	});

	const { _, ...flags } = result;

	return {
		positionals: (_ ?? []) as readonly string[],
		flags,
		flagConfig,
		passThrough,
	};
}
