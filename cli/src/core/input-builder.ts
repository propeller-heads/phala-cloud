import type { ParsedArguments } from "./parser";
import type { CommandMeta } from "./types";
import { toCamelCase } from "./utils";

export interface CommandSchemaInput {
	readonly options: Record<string, unknown>;
	readonly positionals: Record<string, unknown>;
	readonly raw: {
		readonly flags: Record<string, unknown>;
		readonly positionals: readonly string[];
	};
}

export function buildCommandSchemaInput(
	meta: CommandMeta,
	parsed: ParsedArguments,
): CommandSchemaInput {
	const options: Record<string, unknown> = {};

	for (const descriptor of parsed.flagConfig.descriptors.values()) {
		const rawValue = parsed.flags[descriptor.canonicalKey];
		if (rawValue !== undefined) {
			options[descriptor.target] = rawValue;
		}
	}

	for (const descriptor of parsed.flagConfig.negatedLookup.values()) {
		if (descriptor.negatedKey && parsed.flags[descriptor.negatedKey]) {
			options[descriptor.target] = false;
		}
	}

	// Add pass-through arguments if present
	if (parsed.passThrough.length > 0) {
		options["--"] = parsed.passThrough;
	}

	const positionals: Record<string, unknown> = {};
	const declaredArgs = meta.arguments ?? [];
	const values = [...parsed.positionals];
	let index = 0;

	for (const argument of declaredArgs) {
		const target = argument.target ?? toCamelCase(argument.name);
		if (argument.variadic) {
			positionals[target] = values.slice(index);
			index = values.length;
			break;
		}
		if (values[index] !== undefined) {
			positionals[target] = values[index];
		}
		index += 1;
	}

	return {
		options,
		positionals,
		raw: {
			flags: parsed.flags,
			positionals: parsed.positionals,
		},
	};
}
