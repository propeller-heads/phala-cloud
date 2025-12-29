import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { fetchContainerLogs, streamContainerLogs } from "@/src/api/cvms";
import { logger, setJsonMode } from "@/src/utils/logger";
import {
	cvmsLogsCommandMeta,
	cvmsLogsCommandSchema,
	type CvmsLogsCommandInput,
} from "./command";

async function runCvmsLogsCommand(
	input: CvmsLogsCommandInput,
	context: CommandContext,
): Promise<number> {
	// Enable JSON mode if --json flag is set
	setJsonMode(input.json);

	if (!context.cvmId) {
		context.fail(
			"No CVM ID provided. Use --interactive to select interactively.",
		);
		return 1;
	}

	// Extract the CVM ID from the context - dispatcher puts raw ID in 'id' field
	const appId =
		context.cvmId.id ||
		context.cvmId.app_id ||
		context.cvmId.uuid ||
		context.cvmId.name;
	if (!appId) {
		context.fail("Could not determine CVM identifier");
		return 1;
	}

	try {
		const options = {
			tail: input.tail,
			timestamps: input.timestamps,
			container: input.container,
		};

		if (input.follow) {
			// Streaming mode
			if (input.json) {
				context.fail("Cannot use --json with --follow");
				return 1;
			}

			logger.info("Streaming container logs (press Ctrl+C to stop)...");
			logger.break();

			// Set up abort controller for graceful shutdown
			const abortController = new AbortController();

			const cleanup = () => {
				abortController.abort();
				logger.break();
				logger.info("Stopped streaming logs");
				process.exit(0);
			};

			process.on("SIGINT", cleanup);
			process.on("SIGTERM", cleanup);

			try {
				await streamContainerLogs(
					appId,
					(data) => {
						process.stdout.write(data);
					},
					options,
					abortController.signal,
				);
			} catch (error) {
				if ((error as Error).name === "AbortError") {
					// Expected when user cancels
					return 0;
				}
				throw error;
			}

			return 0;
		}

		// Non-streaming mode
		const spinner = logger.startSpinner("Fetching container logs");
		const logs = await fetchContainerLogs(appId, options);
		spinner.stop(true);

		if (input.json) {
			context.success({
				logs,
				cvm_id: appId,
				container: input.container,
			});
			return 0;
		}

		// Print logs directly to stdout
		if (logs.trim()) {
			console.log(logs);
		} else {
			logger.info("No logs available");
		}

		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed to fetch logs: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return 1;
	}
}

export const cvmsLogsCommand = defineCommand({
	path: ["cvms", "logs"],
	meta: cvmsLogsCommandMeta,
	schema: cvmsLogsCommandSchema,
	handler: runCvmsLogsCommand,
});

export default cvmsLogsCommand;
