import path from "node:path";
import fs from "fs-extra";
import {
	type ProvisionCvmComposeFileUpdateRequest,
	safeGetCvmComposeFile,
	safeProvisionCvmComposeFileUpdate,
	safeGetCvmInfo,
	parseEnvVars,
} from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getClient } from "@/src/lib/client";
import { logger } from "@/src/utils/logger";
import { parseEnvInputs } from "@/src/utils/env-parsing";
import {
	composeHashMeta,
	composeHashSchema,
	type ComposeHashInput,
} from "./command";

async function handler(
	input: ComposeHashInput,
	context: CommandContext,
): Promise<number> {
	try {
		const client = await getClient();

		// Resolve compose file path
		const composePath = input.compose || "docker-compose.yml";
		if (!fs.existsSync(composePath)) {
			context.fail(`Docker compose file not found: ${composePath}`);
			return 1;
		}
		const dockerComposeYml = fs.readFileSync(composePath, "utf8");

		// Read pre-launch script if specified
		let preLaunchScriptContent: string | undefined;
		if (input.preLaunchScript) {
			if (!fs.existsSync(input.preLaunchScript)) {
				context.fail(
					`Pre-launch script file not found: ${input.preLaunchScript}`,
				);
				return 1;
			}
			preLaunchScriptContent = fs.readFileSync(input.preLaunchScript, "utf8");
		}

		// Parse env vars if provided
		let envKeys: string[] | undefined;
		if (input.env && input.env.length > 0) {
			const parsed = parseEnvInputs(input.env);
			const allEnvs: { key: string; value: string }[] = [];

			for (const filePath of parsed.files) {
				const resolvedPath = path.resolve(process.cwd(), filePath);
				if (!fs.existsSync(resolvedPath)) {
					context.fail(`Environment file not found: ${filePath}`);
					return 1;
				}
				const envContent = fs.readFileSync(resolvedPath, { encoding: "utf8" });
				allEnvs.push(...parseEnvVars(envContent));
			}
			allEnvs.push(...parsed.keyValues);

			if (allEnvs.length > 0) {
				envKeys = allEnvs.map((e) => e.key);
			}
		}

		// Fetch existing CVM compose
		const composeResult = await safeGetCvmComposeFile(client, {
			id: input.cvm,
		});
		if (!composeResult.success) {
			context.fail(composeResult.error.message);
			return 1;
		}

		// Fetch CVM info for app_id
		const infoResult = await safeGetCvmInfo(client, { id: input.cvm });
		if (!infoResult.success) {
			context.fail(infoResult.error.message);
			return 1;
		}

		// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
		const appCompose = composeResult.data as any;

		// Patch the compose (same as updateCvm in deploy handler)
		appCompose.docker_compose_file = dockerComposeYml;
		if (preLaunchScriptContent) {
			appCompose.pre_launch_script = preLaunchScriptContent;
		}
		if (envKeys && envKeys.length > 0) {
			appCompose.allowed_envs = envKeys;
		}

		// Provision to get the server-computed compose_hash
		const provisionResult = await safeProvisionCvmComposeFileUpdate(client, {
			id: input.cvm,
			app_compose:
				appCompose as ProvisionCvmComposeFileUpdateRequest["app_compose"],
			update_env_vars: !!(envKeys && envKeys.length > 0),
		});
		if (!provisionResult.success) {
			context.fail(provisionResult.error.message);
			return 1;
		}

		// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
		const provision = provisionResult.data as any;
		// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
		const cvm = infoResult.data as any;

		if (input.json) {
			context.success({
				compose_hash: provision.compose_hash,
				app_id: cvm.app_id,
				cvm_id: input.cvm,
			});
			return 0;
		}

		logger.info(`CVM:          ${input.cvm}`);
		logger.info(`App ID:       ${cvm.app_id}`);
		logger.info(`Compose Hash: ${provision.compose_hash}`);
		logger.info("");
		logger.info(
			"Submit addComposeHash(<compose_hash>) to the DstackApp contract via your Safe or external signer.",
		);
		logger.info(
			"Then run: phala deploy --cvm-id <id> -c <compose-file> --skip-onchain-tx",
		);

		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

export const composeHashCommand = defineCommand({
	path: ["compose-hash"],
	meta: composeHashMeta,
	schema: composeHashSchema,
	handler,
});
