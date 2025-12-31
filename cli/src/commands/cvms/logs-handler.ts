import { CvmIdSchema } from "@phala/cloud";
import type { CommandContext } from "@/src/core/types";
import { logger, setJsonMode } from "@/src/utils/logger";

export interface LogsHandlerConfig<TOptions> {
	logType: "container" | "serial";
	fetchLogs: (appId: string, options: TOptions) => Promise<string>;
	streamLogs: (
		appId: string,
		onData: (data: string) => void,
		options: TOptions,
		signal?: AbortSignal,
	) => Promise<void>;
}

export interface BaseLogsInput {
	json?: boolean;
	follow?: boolean;
	tail?: number;
	timestamps?: boolean;
}

/**
 * Extract and normalize CVM ID from context using SDK's CvmIdSchema
 * This ensures proper ID format (e.g., adding app_ prefix to 40-char hex)
 */
export function extractCvmId(context: CommandContext): string | null {
	if (!context.cvmId) return null;
	try {
		const { cvmId } = CvmIdSchema.parse(context.cvmId);
		return cvmId;
	} catch {
		return null;
	}
}

/**
 * Create a logs command handler with shared logic
 */
export function createLogsHandler<TInput extends BaseLogsInput, TOptions>(
	config: LogsHandlerConfig<TOptions>,
	buildOptions: (input: TInput) => TOptions,
) {
	return async function handler(
		input: TInput,
		context: CommandContext,
	): Promise<number> {
		setJsonMode(input.json);

		if (!context.cvmId) {
			context.fail("No CVM ID provided. Use --interactive to select interactively.");
			return 1;
		}

		const appId = extractCvmId(context);
		if (!appId) {
			context.fail("Could not determine CVM identifier");
			return 1;
		}

		const options = buildOptions(input);
		const logTypeName = config.logType === "serial" ? "serial" : "container";

		try {
			if (input.follow) {
				if (input.json) {
					context.fail("Cannot use --json with --follow");
					return 1;
				}

				logger.info(`Streaming ${logTypeName} logs (press Ctrl+C to stop)...`);
				logger.break();

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
					await config.streamLogs(
						appId,
						(data) => process.stdout.write(data),
						options,
						abortController.signal,
					);
				} catch (error) {
					if ((error as Error).name === "AbortError") {
						return 0;
					}
					throw error;
				} finally {
					process.removeListener("SIGINT", cleanup);
					process.removeListener("SIGTERM", cleanup);
				}

				return 0;
			}

			// Non-streaming mode - no spinner to support piping (e.g., phala cvms logs xx | grep foo)
			const logs = await config.fetchLogs(appId, options);

			if (input.json) {
				context.success({ logs, cvm_id: appId });
				return 0;
			}

			if (logs.trim()) {
				console.log(logs);
			} else {
				logger.info("No logs available");
			}

			return 0;
		} catch (error) {
			logger.logDetailedError(error);
			context.fail(
				`Failed to fetch ${logTypeName} logs: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			return 1;
		}
	};
}
