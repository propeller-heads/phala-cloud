import inquirer from "inquirer";
import { safeDeleteCvm, safeGetCvmInfo } from "@phala/cloud";
import { getCvmIdInput } from "@/src/utils/cvms";
import { getClient } from "@/src/lib/client";
import { logger } from "@/src/utils/logger";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import type { CvmInfoResponse } from "@/src/api/types";
import {
	cvmsDeleteCommandMeta,
	cvmsDeleteCommandSchema,
	type CvmsDeleteCommandInput,
} from "./command";

async function runCvmsDeleteCommand(
	input: CvmsDeleteCommandInput,
	context: CommandContext,
): Promise<number> {
	try {
		const cvmIdInput = await getCvmIdInput(input.cvmId);

		if (!cvmIdInput) {
			context.fail("No CVM ID provided.");
			return 1;
		}

		const client = await getClient();

		// Get CVM details for confirmation message
		const infoResult = await safeGetCvmInfo(client, cvmIdInput);

		if (!infoResult.success) {
			context.fail(infoResult.error.message);
			return 1;
		}

		const cvm = infoResult.data as CvmInfoResponse | undefined;

		if (!cvm) {
			context.fail("CVM not found");
			return 1;
		}

		const cvmIdentifier = cvm.name || `app_${cvm.app_id}`;

		if (!input.force && !input.yes) {
			const { confirm } = await inquirer.prompt([
				{
					type: "confirm",
					name: "confirm",
					message: `Are you sure you want to delete CVM "${cvmIdentifier}"? This action cannot be undone.`,
					default: false,
				},
			]);

			if (!confirm) {
				logger.info("Deletion cancelled");
				return 0;
			}
		}

		const spinner = logger.startSpinner(`Deleting CVM ${cvmIdentifier}`);
		const result = await safeDeleteCvm(client, cvmIdInput);
		spinner.stop(true);

		if (!result.success) {
			logger.error(
				`Failed to delete CVM ${cvmIdentifier}: ${result.error.message}`,
			);
			return 1;
		}

		logger.success(`CVM ${cvmIdentifier} deleted successfully`);
		return 0;
	} catch (error) {
		logger.error("Failed to delete CVM");
		logger.logDetailedError(error);
		return 1;
	}
}

export const cvmsDeleteCommand = defineCommand({
	path: ["cvms", "delete"],
	meta: cvmsDeleteCommandMeta,
	schema: cvmsDeleteCommandSchema,
	handler: runCvmsDeleteCommand,
});

export default cvmsDeleteCommand;
