import { ZodError } from "zod";
import { buildCommandSchemaInput } from "./input-builder";
import { parseCommandArguments } from "./parser";
import type { CommandRegistry } from "./registry";
import { formatCommandHelp, formatGlobalHelp } from "./help";
import type { CommandContext, CommandDefinition } from "./types";

export interface DispatchOptions {
	readonly registry: CommandRegistry;
	readonly argv: readonly string[];
	readonly executableName: string;
	readonly version: string;
	readonly cwd: string;
	readonly env: NodeJS.ProcessEnv;
	readonly stdout: NodeJS.WriteStream;
	readonly stderr: NodeJS.WriteStream;
	readonly stdin: NodeJS.ReadStream;
}

export async function dispatchCommand(
	options: DispatchOptions,
): Promise<number> {
	const {
		registry,
		argv,
		executableName,
		version,
		stdout,
		stderr,
		stdin,
		env,
		cwd,
	} = options;

	const commandSegments = collectCommandSegments(argv);
	const resolved = registry.resolveCommand(commandSegments);

	if (!resolved) {
		return handleGlobalRequest({
			registry,
			argv,
			executableName,
			version,
			stdout,
			stderr,
		});
	}

	const { definition, consumed } = resolved;
	const commandArgv = argv.slice(consumed.length);

	try {
		const parsedArguments = parseCommandArguments(
			commandArgv,
			definition.meta.options,
		);

		if (parsedArguments.flags["--version"]) {
			stdout.write(`${version}\n`);
			return 0;
		}

		if (parsedArguments.flags["--help"]) {
			stdout.write(
				`${formatCommandHelp({ executableName, definition, registry })}\n`,
			);
			return 0;
		}

		const schemaInput = buildCommandSchemaInput(
			definition.meta,
			parsedArguments,
		);

		const mergedInput = {
			...schemaInput.options,
			...schemaInput.positionals,
			options: schemaInput.options,
			positionals: schemaInput.positionals,
			raw: schemaInput.raw,
		};

		const context: CommandContext = {
			argv: commandArgv,
			rawFlags: parsedArguments.flags,
			rawPositionals: parsedArguments.positionals,
			cwd,
			env,
			stdout,
			stderr,
			stdin,
		};

		const parsedInput = definition.schema.parse(mergedInput);
		const result = await definition.run(parsedInput, context);
		if (typeof result === "number") {
			return result;
		}
		return 0;
	} catch (error) {
		if (error instanceof ZodError) {
			stderr.write(formatValidationError(error));
			return 1;
		}
		if (isArgError(error)) {
			stderr.write(`${error.message}\n`);
			return 1;
		}
		throw error;
	}
}

interface GlobalRequestOptions {
	readonly registry: CommandRegistry;
	readonly argv: readonly string[];
	readonly executableName: string;
	readonly version: string;
	readonly stdout: NodeJS.WriteStream;
	readonly stderr: NodeJS.WriteStream;
}

function handleGlobalRequest(options: GlobalRequestOptions): number {
	const { registry, argv, executableName, version, stdout, stderr } = options;

	try {
		const parsed = parseCommandArguments(argv, undefined);

		if (parsed.flags["--version"]) {
			stdout.write(`${version}\n`);
			return 0;
		}

		if (parsed.flags["--help"]) {
			stdout.write(`${formatGlobalHelp({ registry, executableName })}\n`);
			return 0;
		}

		if (parsed.positionals.length === 0) {
			stderr.write(
				`No command provided. Run \`${executableName} --help\` for usage information.\n`,
			);
			return 1;
		}

		const unknown = parsed.positionals.join(" ");
		stderr.write(
			`Unknown command \"${unknown}\". Run \`${executableName} --help\` for a list of commands.\n`,
		);
		return 1;
	} catch (error) {
		if (isArgError(error)) {
			stderr.write(`${error.message}\n`);
			return 1;
		}
		throw error;
	}
}

function collectCommandSegments(argv: readonly string[]): string[] {
	const segments: string[] = [];
	for (const token of argv) {
		if (token.startsWith("-")) {
			break;
		}
		segments.push(token);
	}
	return segments;
}

function formatValidationError(error: ZodError): string {
	const firstIssue = error.issues[0];
	if (!firstIssue) {
		return `${error.message}\n`;
	}
	const path = firstIssue.path.length > 0 ? firstIssue.path.join(".") : "input";
	return `Invalid value for \"${path}\": ${firstIssue.message}\n`;
}

function isArgError(error: unknown): error is Error & { code?: string } {
	return (
		error instanceof Error &&
		Object.prototype.hasOwnProperty.call(error, "code") &&
		// @ts-ignore -- arg uses ERR_UNKNOWN_OPTION and friends
		// biome-ignore lint/suspicious/noExplicitAny: arg library error type
		typeof (error as any).code === "string"
	);
}
