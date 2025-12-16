import { z } from "zod";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext, CommandMeta } from "@/src/core/types";
import {
	getCompletions,
	generateCompletionScript,
} from "@/src/core/completion";
import { generateFigSpec, exportFigSpecAsModule } from "@/src/core/fig-spec";

// Get CLI version
function getCliVersion(): string {
	try {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);
		// In dist/index.js, package.json is ../package.json
		const packageJsonPath = join(__dirname, "../package.json");
		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
		return packageJson.version;
	} catch (error) {
		// Fallback: try to get version from phala --version command
		return "unknown";
	}
}

// Hidden command for shell completion
const completeCommandMeta: CommandMeta = {
	name: "__complete",
	description: "Internal command for shell completion",
	stability: "stable",
	arguments: [
		{
			name: "line",
			description: "Full command line",
			required: true,
		},
		{
			name: "fragment",
			description: "Current word being completed",
			required: true,
		},
	],
};

const completeCommandSchema = z.object({
	line: z.string(),
	fragment: z.string(),
});

type CompleteCommandInput = z.infer<typeof completeCommandSchema>;

async function handleComplete(
	input: CompleteCommandInput,
	context: CommandContext,
): Promise<number> {
	// This would need access to registry - we'll pass it via a global or context
	// For now, return empty
	context.stdout.write("\n");
	return 0;
}

export const completeCommand = defineCommand({
	path: ["__complete"],
	meta: completeCommandMeta,
	schema: completeCommandSchema,
	handler: handleComplete,
});

// User-facing completion setup command
const completionCommandMeta: CommandMeta = {
	name: "completion",
	description: "Generate shell completion scripts",
	stability: "stable",
	options: [
		{
			name: "shell",
			type: "string",
			description: "Shell type (bash, zsh, fish)",
		},
		{
			name: "fig",
			type: "boolean",
			description: "Generate Fig/Amazon Q completion spec",
		},
	],
};

const completionCommandSchema = z.object({
	shell: z.enum(["bash", "zsh", "fish"]).optional(),
	fig: z.boolean().optional(),
});

type CompletionCommandInput = z.infer<typeof completionCommandSchema>;

async function handleCompletion(
	input: CompletionCommandInput,
	context: CommandContext,
): Promise<number> {
	// If --fig is specified, generate Fig spec instead
	if (input.fig) {
		// We need access to registry - this is a placeholder
		// You'll need to pass registry through context or make it available globally
		context.stdout.write(
			"Fig spec generation requires registry access. See fig-spec.ts for implementation.\n",
		);
		return 0;
	}

	const shell = input.shell || detectShell();

	if (!shell) {
		context.stderr.write(
			"Could not detect shell. Please specify with --shell (bash, zsh, or fish)\n",
		);
		return 1;
	}

	const version = getCliVersion();
	const script = generateCompletionScript("phala", shell, version);

	context.stdout.write("# Add this to your shell configuration file:\n\n");
	context.stdout.write(`${script}\n\n`);

	context.stdout.write("# Installation instructions:\n");

	switch (shell) {
		case "bash":
			context.stdout.write("# For bash, add to ~/.bashrc:\n");
			context.stdout.write("#   phala completion --shell bash >> ~/.bashrc\n");
			context.stdout.write("#   source ~/.bashrc\n");
			break;
		case "zsh":
			context.stdout.write("# For zsh, add to ~/.zshrc:\n");
			context.stdout.write("#   phala completion --shell zsh >> ~/.zshrc\n");
			context.stdout.write("#   source ~/.zshrc\n");
			break;
		case "fish":
			context.stdout.write("# For fish, run:\n");
			context.stdout.write(
				"#   phala completion --shell fish > ~/.config/fish/completions/phala.fish\n",
			);
			break;
	}

	return 0;
}

function detectShell(): "bash" | "zsh" | "fish" | null {
	const shell = process.env.SHELL || "";

	if (shell.includes("bash")) {
		return "bash";
	}
	if (shell.includes("zsh")) {
		return "zsh";
	}
	if (shell.includes("fish")) {
		return "fish";
	}

	return null;
}

export const completionCommand = defineCommand({
	path: ["completion"],
	meta: completionCommandMeta,
	schema: completionCommandSchema,
	handler: handleCompletion,
});
