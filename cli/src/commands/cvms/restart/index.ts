import { restartCvm } from "@/src/api/cvms";
import { CLOUD_URL } from "@/src/utils/constants";
import { resolveCvmAppId } from "@/src/utils/cvms";
import { logger } from "@/src/utils/logger";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import {
	cvmsRestartCommandMeta,
	cvmsRestartCommandSchema,
	type CvmsRestartCommandInput,
} from "./command";

async function runCvmsRestartCommand(
	input: CvmsRestartCommandInput,
	_context: CommandContext,
): Promise<number> {
	try {
		const resolvedAppId = await resolveCvmAppId(input.appId);

		const spinner = logger.startSpinner(
			`Restarting CVM with App ID app_${resolvedAppId}`,
		);

		const response = await restartCvm(resolvedAppId);

		spinner.stop(true);
		logger.break();

		logger.keyValueTable(
			{
				"CVM ID": response.id,
				Name: response.name,
				Status: response.status,
				"App ID": `app_${response.app_id}`,
				"App URL":
					response.app_url ||
					`${CLOUD_URL}/dashboard/cvms/app_${response.app_id}`,
			},
			{ borderStyle: "rounded" },
		);

		logger.break();
		logger.success(
			`Your CVM is being restarted. You can check the dashboard for more details:
${CLOUD_URL}/dashboard/cvms/app_${response.app_id}`,
		);
		return 0;
	} catch (error) {
		logger.error(
			`Failed to restart CVM: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

export const cvmsRestartCommand = defineCommand({
	path: ["cvms", "restart"],
	meta: cvmsRestartCommandMeta,
	schema: cvmsRestartCommandSchema,
	handler: runCvmsRestartCommand,
});

export default cvmsRestartCommand;
