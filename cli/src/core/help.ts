import { globalCommandOptions } from "./common-flags";
import type {
	CommandDefinition,
	CommandOption,
	CommandPath,
	CommandStability,
} from "./types";
import type { CommandRegistry } from "./registry";

function formatStabilityIndicator(stability: CommandStability): string {
	if (stability === "unstable") return " [UNSTABLE]";
	if (stability === "deprecated") return " [DEPRECATED]";
	return "";
}

interface GlobalHelpOptions {
	readonly registry: CommandRegistry;
	readonly executableName: string;
}

interface CommandHelpOptions {
	readonly executableName: string;
	readonly definition: CommandDefinition;
	readonly registry: CommandRegistry;
}

interface GroupHelpOptions {
	readonly registry: CommandRegistry;
	readonly executableName: string;
	readonly groupPath: CommandPath;
}

export function formatGlobalHelp(options: GlobalHelpOptions): string {
	const { registry, executableName } = options;
	const lines: string[] = [];

	lines.push(`Usage: ${executableName} <command> [options]`);
	lines.push("");
	lines.push("Available commands:");

	for (const node of registry.getChildren()) {
		const meta = node.command?.meta ?? node.group?.meta;
		const description = (meta?.description ?? "").split("\n")[0];
		const stability = meta?.stability;
		const indicator = stability ? formatStabilityIndicator(stability) : "";
		const name = node.name ?? "";
		lines.push(`  ${name.padEnd(18)}${description}${indicator}`.trimEnd());
	}

	lines.push("");
	lines.push("Global options:");
	for (const option of globalCommandOptions) {
		lines.push(
			`  ${formatOptionSignature(option).padEnd(24)}${option.description ?? ""}`.trimEnd(),
		);
	}

	return lines.join("\n");
}

export function formatGroupHelp(options: GroupHelpOptions): string {
	const { registry, executableName, groupPath } = options;
	const groupNode = registry.getNode(groupPath);

	if (!groupNode?.group) {
		return formatGlobalHelp({ registry, executableName });
	}

	const lines: string[] = [];
	const groupName = groupPath.join(" ");
	const fullCommand = `${executableName} ${groupName}`;

	lines.push(`Usage: ${fullCommand} <command> [options]`);
	lines.push("");

	if (groupNode.group.meta.description) {
		lines.push(groupNode.group.meta.description);
		lines.push("");
	}

	const children = registry.getChildren(groupPath);
	if (children.length > 0) {
		lines.push("Available commands:");
		for (const child of children) {
			const meta = child.command?.meta ?? child.group?.meta;
			const description = (meta?.description ?? "").split("\n")[0];
			const stability = meta?.stability;
			const indicator = stability ? formatStabilityIndicator(stability) : "";
			const name = child.name ?? "";
			lines.push(`  ${name.padEnd(18)}${description}${indicator}`.trimEnd());
		}
		lines.push("");
	}

	lines.push("Global options:");
	for (const option of globalCommandOptions) {
		lines.push(
			`  ${formatOptionSignature(option).padEnd(24)}${option.description ?? ""}`.trimEnd(),
		);
	}

	return lines.join("\n");
}

export function formatCommandHelp(options: CommandHelpOptions): string {
	const { executableName, definition, registry } = options;
	const usage = buildUsageLine({ executableName, definition });
	const indicator = formatStabilityIndicator(definition.meta.stability);
	const lines: string[] = [
		usage,
		"",
		`${definition.meta.description}${indicator}`,
	];

	const args = definition.meta.arguments ?? [];
	if (args.length > 0) {
		lines.push("");
		lines.push("Arguments:");
		for (const argument of args) {
			const signature = formatArgumentSignature(argument);
			lines.push(
				`  ${signature.padEnd(18)}${argument.description ?? ""}`.trimEnd(),
			);
		}
	}

	const allOptions = [...(definition.meta.options ?? [])];
	const visibleGlobalOptions = globalCommandOptions.filter((o) => !o.hidden);
	const visibleCommandOptions = allOptions.filter((o) => !o.hidden);
	const globalOptionNames = new Set(globalCommandOptions.map((o) => o.name));
	const visibleNonGlobalCommandOptions = visibleCommandOptions.filter(
		(o) => !globalOptionNames.has(o.name),
	);

	if (visibleGlobalOptions.length > 0) {
		const commandShorthands = new Set(
			visibleNonGlobalCommandOptions
				.map((o) => o.shorthand)
				.filter((s): s is string => typeof s === "string" && s.length > 0),
		);

		lines.push("");
		lines.push("Global options:");
		for (const option of visibleGlobalOptions) {
			const includeShorthand =
				!option.shorthand || !commandShorthands.has(option.shorthand);
			lines.push(
				`  ${formatOptionSignature(option, { includeShorthand }).padEnd(24)}${option.description ?? ""}`.trimEnd(),
			);
		}
	}

	if (visibleNonGlobalCommandOptions.length > 0) {
		const isDeprecatedOption = (option: CommandOption): boolean => {
			if (option.group === "deprecated") return true;
			if (option.deprecated) return true;
			const description = option.description ?? "";
			return description.includes("[DEPRECATED]");
		};

		const groupName = (
			option: CommandOption,
		): "basic" | "advanced" | "deprecated" => {
			if (option.group) return option.group;
			if (isDeprecatedOption(option)) return "deprecated";
			return "basic";
		};

		const groups: Record<"basic" | "advanced" | "deprecated", CommandOption[]> =
			{
				basic: [],
				advanced: [],
				deprecated: [],
			};

		for (const option of visibleNonGlobalCommandOptions) {
			groups[groupName(option)].push(option);
		}

		const emitGroup = (title: string, options: CommandOption[]): void => {
			if (options.length === 0) return;
			lines.push("");
			lines.push(title);
			for (const option of options) {
				lines.push(
					`  ${formatOptionSignature(option).padEnd(24)}${option.description ?? ""}`.trimEnd(),
				);
			}
		};

		emitGroup("Basic options:", groups.basic);
		emitGroup("Advanced options:", groups.advanced);
		emitGroup("Deprecated options:", groups.deprecated);
	}

	// Pass-through arguments section
	if (definition.meta.passThrough) {
		lines.push("");
		lines.push("Pass-through (after --):");
		lines.push(`  ${definition.meta.passThrough.description}`);
		if (
			definition.meta.passThrough.examples &&
			definition.meta.passThrough.examples.length > 0
		) {
			lines.push("");
			lines.push("  Examples:");
			for (const example of definition.meta.passThrough.examples) {
				lines.push(`    ${example}`);
			}
		}
	}

	if (definition.meta.examples && definition.meta.examples.length > 0) {
		lines.push("");
		lines.push("Examples:");
		for (const example of definition.meta.examples) {
			lines.push(`  # ${example.name}`);
			lines.push(`  ${example.value}`);
		}
	}

	const children = registry.getChildren(definition.path);
	if (children.length > 0) {
		lines.push("");
		lines.push("Subcommands:");
		for (const child of children) {
			const meta = child.command?.meta ?? child.group?.meta;
			const description = (meta?.description ?? "").split("\n")[0];
			const stability = meta?.stability;
			const childIndicator = stability
				? formatStabilityIndicator(stability)
				: "";
			const name = child.name ?? "";
			lines.push(
				`  ${name.padEnd(18)}${description}${childIndicator}`.trimEnd(),
			);
		}
	}

	return lines.join("\n");
}

function buildUsageLine({
	executableName,
	definition,
}: {
	executableName: string;
	definition: CommandDefinition;
}): string {
	const segments = [executableName, ...definition.path];
	const args = definition.meta.arguments ?? [];
	const positionalSegment = args
		.map((argument) => formatArgumentUsage(argument))
		.join(" ");
	const hasOptions = (definition.meta.options?.length ?? 0) > 0;
	const optionsPart = hasOptions ? " [options]" : "";
	const argsPart = positionalSegment ? ` ${positionalSegment}` : "";
	const passThroughPart = definition.meta.passThrough ? " [--] [...]" : "";
	return `Usage: ${segments.join(" ")}${optionsPart}${argsPart}${passThroughPart}`;
}

function formatArgumentUsage(argument: {
	name: string;
	required?: boolean;
	variadic?: boolean;
}): string {
	const base = `<${argument.name}>`;
	if (argument.variadic) {
		return `${base}...`;
	}
	if (argument.required === false) {
		return `[${base}]`;
	}
	return base;
}

function formatArgumentSignature(argument: {
	name: string;
	required?: boolean;
	variadic?: boolean;
}): string {
	if (argument.variadic) {
		return `<${argument.name}...>`;
	}
	if (argument.required === false) {
		return `<${argument.name}>?`;
	}
	return `<${argument.name}>`;
}

function formatOptionSignature(
	option: CommandOption,
	{ includeShorthand = true }: { includeShorthand?: boolean } = {},
): string {
	const parts: string[] = [];
	if (includeShorthand && option.shorthand) {
		parts.push(`-${option.shorthand}`);
	}
	let signature = `--${option.name}`;
	if (option.argumentName) {
		signature += ` ${option.argumentName.toUpperCase()}`;
	} else if (option.type !== "boolean") {
		signature += " <value>";
	}
	parts.push(signature);

	// Add aliases
	if (option.aliases && option.aliases.length > 0) {
		for (const alias of option.aliases) {
			let aliasSignature = `--${alias}`;
			if (option.argumentName) {
				aliasSignature += ` ${option.argumentName.toUpperCase()}`;
			} else if (option.type !== "boolean") {
				aliasSignature += " <value>";
			}
			parts.push(aliasSignature);
		}
	}

	// Add negated form for boolean flags
	if (option.type === "boolean" && option.negatedName) {
		parts.push(`--${option.negatedName}`);
	}

	return parts.join(", ");
}
