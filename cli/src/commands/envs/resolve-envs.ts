import fs from "node:fs";
import path from "node:path";
import type { EnvVar } from "@phala/cloud";
import { parseEnvVars } from "@phala/cloud";
import { dedupeEnvVars, parseEnvInputs } from "@/src/utils/env-parsing";

/**
 * Parse -e inputs into a deduplicated EnvVar array.
 * Supports both KEY=VALUE pairs and file paths.
 * Files are loaded first, then KEY=VALUE pairs override.
 */
export function resolveEnvInputs(inputs: string[]): EnvVar[] {
	const parsed = parseEnvInputs(inputs);
	const envs: EnvVar[] = [];

	for (const filePath of parsed.files) {
		const resolved = path.resolve(filePath);
		if (!fs.existsSync(resolved)) {
			throw new Error(`Environment file not found: ${filePath}`);
		}
		const content = fs.readFileSync(resolved, "utf8");
		const fileEnvs = parseEnvVars(content);
		envs.push(...fileEnvs);
	}

	envs.push(...parsed.keyValues);
	return dedupeEnvVars(envs);
}
