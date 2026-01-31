import { CvmIdSchema } from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import {
	fetchContainerLogsEntries,
	streamContainerLogsEntries,
	type ContainerLogsOptions,
	type LogEntry,
} from "@/src/api/cvms";
import { logger, setJsonMode } from "@/src/utils/logger";
import { checkAndWarnIfLogsDisabled } from "@/src/commands/cvms/logs-handler";
import {
	logsCommandMeta,
	logsCommandSchema,
	type LogsCommandInput,
} from "./command";

function writeLogEntry(
	entry: LogEntry,
	config: { includeStdout: boolean; includeStderr: boolean },
	context: Pick<CommandContext, "stdout" | "stderr">,
): void {
	if (entry.channel === "stdout") {
		if (config.includeStdout) {
			context.stdout.write(entry.message);
		}
		return;
	}

	if (config.includeStderr) {
		context.stderr.write(entry.message);
	}
}

async function runLogsCommand(
	input: LogsCommandInput,
	context: CommandContext,
): Promise<number> {
	setJsonMode(input.json);

	if (!context.cvmId) {
		context.fail(
			"No CVM ID provided. Use --interactive to select interactively.",
		);
		return 1;
	}

	const { cvmId: appId } = CvmIdSchema.parse(context.cvmId);

	const outputConfig = {
		includeStdout: input.stdout,
		includeStderr: input.stderr,
	};

	if (!outputConfig.includeStdout && !outputConfig.includeStderr) {
		context.fail("Nothing to show: both stdout and stderr are disabled");
		return 1;
	}

	const options: ContainerLogsOptions = {
		container: input.containerName,
		since: input.since,
		until: input.until,
		tail: input.tail,
		timestamps: input.timestamps,
		matchContainerIdPrefix: false,
	};

	try {
		if (input.follow) {
			if (input.json) {
				context.fail("Cannot use --json with --follow");
				return 1;
			}

			const abortController = new AbortController();
			const cleanup = () => abortController.abort();

			process.on("SIGINT", cleanup);
			process.on("SIGTERM", cleanup);

			try {
				await streamContainerLogsEntries(
					appId,
					(entry) => writeLogEntry(entry, outputConfig, context),
					options,
					abortController.signal,
				);
			} catch (error) {
				if ((error as Error).name !== "AbortError") {
					throw error;
				}
			} finally {
				process.removeListener("SIGINT", cleanup);
				process.removeListener("SIGTERM", cleanup);
			}

			return 0;
		}

		const entries = await fetchContainerLogsEntries(appId, options);
		const filteredEntries = entries.filter((e) =>
			e.channel === "stderr" ? outputConfig.includeStderr : outputConfig.includeStdout,
		);
		const combined = filteredEntries.map((e) => e.message).join("");

		if (input.json) {
			context.success({ logs: combined, cvm_id: appId });
			return 0;
		}

		if (combined.trim()) {
			for (const entry of filteredEntries) {
				writeLogEntry(entry, outputConfig, context);
			}
			return 0;
		}

		const logsDisabled = await checkAndWarnIfLogsDisabled(appId);
		if (!logsDisabled) {
			logger.info("No logs available");
		}
		return 0;
	} catch (error) {
		context.fail(
			`Failed to fetch container logs: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		await checkAndWarnIfLogsDisabled(appId);
		return 1;
	}
}

export const logsCommand = defineCommand({
	path: ["logs"],
	meta: logsCommandMeta,
	schema: logsCommandSchema,
	handler: runLogsCommand,
});

export default logsCommand;
