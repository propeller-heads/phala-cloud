import { safeStartCvm, type VM } from "@phala/cloud";
import { CLOUD_URL } from "@/src/utils/constants";
import { getCvmIdInput } from "@/src/utils/cvms";
import { getClient } from "@/src/lib/client";
import { logger } from "@/src/utils/logger";
import { retryOnConflict } from "@/src/utils/retry";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import {
	cvmsStartCommandMeta,
	cvmsStartCommandSchema,
	type CvmsStartCommandInput,
} from "./command";

async function runCvmsStartCommand(
	input: CvmsStartCommandInput,
	context: CommandContext,
): Promise<number> {
	try {
		const cvmIdInput = await getCvmIdInput(input.cvmId);

		if (!cvmIdInput) {
			context.fail("No CVM ID provided.");
			return 1;
		}

		const client = await getClient();
		const spinner = logger.startSpinner("Starting CVM");

		const result = await retryOnConflict(
			() => safeStartCvm(client, cvmIdInput),
			{ spinner },
		);

		spinner.stop(true);

		if (!result.success) {
			logger.error(`Failed to start CVM: ${result.error.message}`);
			return 1;
		}

		const response = result.data as VM;
		logger.break();

		logger.keyValueTable(
			{
				"CVM ID": response.id,
				Name: response.name,
				Status: response.status,
				"App ID": `app_${response.app_id}`,
			},
			{ borderStyle: "rounded" },
		);

		logger.break();
		logger.success(
			`Your CVM is being started. You can check the dashboard for more details:
${CLOUD_URL}/dashboard/cvms/app_${response.app_id}`,
		);
		return 0;
	} catch (error) {
		logger.error("Failed to start CVM");
		logger.logDetailedError(error);
		return 1;
	}
}

export const cvmsStartCommand = defineCommand({
	path: ["cvms", "start"],
	meta: cvmsStartCommandMeta,
	schema: cvmsStartCommandSchema,
	handler: runCvmsStartCommand,
});

export default cvmsStartCommand;
