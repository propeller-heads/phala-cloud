import path from "node:path";
import fs from "fs-extra";
import toml from "@iarna/toml";
import { z } from "zod";
import { logger } from "./logger";

// Supported API versions from @phala/cloud
const SUPPORTED_API_VERSIONS = ["2025-05-31"] as const;

// Project configuration schema
export const ProjectConfigSchema = z
	.object({
		api_version: z.enum(SUPPORTED_API_VERSIONS),
		app_id: z.string().optional(),
		vm_uuid: z.string().optional(),
	})
	.strict();

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

const CONFIG_FILE_NAME = "phala.toml";

/**
 * Get the path to phala.toml in the current working directory
 */
function getProjectConfigPath(): string {
	return path.join(process.cwd(), CONFIG_FILE_NAME);
}

/**
 * Check if phala.toml exists in the current directory
 */
export function projectConfigExists(): boolean {
	return fs.existsSync(getProjectConfigPath());
}

/**
 * Load project configuration from phala.toml
 * @throws Error if file doesn't exist or validation fails
 */
export function loadProjectConfig(): ProjectConfig {
	const configPath = getProjectConfigPath();

	if (!fs.existsSync(configPath)) {
		throw new Error(
			`Project configuration file not found: ${CONFIG_FILE_NAME}\nRun 'phala init' to create one.`,
		);
	}

	try {
		const fileContent = fs.readFileSync(configPath, "utf8");
		const parsed = toml.parse(fileContent);
		return ProjectConfigSchema.parse(parsed);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const issues = error.issues
				.map((i) => `  - ${i.path.join(".")}: ${i.message}`)
				.join("\n");
			throw new Error(`Invalid project configuration:\n${issues}`);
		}
		throw new Error(
			`Failed to parse ${CONFIG_FILE_NAME}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Save project configuration to phala.toml
 */
export function saveProjectConfig(config: ProjectConfig): void {
	const configPath = getProjectConfigPath();

	try {
		// Validate before saving
		const validated = ProjectConfigSchema.parse(config);

		// Convert to TOML format
		const tomlContent = toml.stringify(validated as toml.JsonMap);

		// Write to file
		fs.writeFileSync(configPath, tomlContent, "utf8");
		logger.success(`Project configuration saved to ${CONFIG_FILE_NAME}`);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const issues = error.issues
				.map((i) => `  - ${i.path.join(".")}: ${i.message}`)
				.join("\n");
			throw new Error(`Invalid configuration:\n${issues}`);
		}
		throw new Error(
			`Failed to save ${CONFIG_FILE_NAME}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
