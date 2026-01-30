import prompts from "prompts";
import { execa } from "execa";
import semver from "semver";
import chalk from "chalk";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { logger, setJsonMode } from "@/src/utils/logger";
import { getStateValue, saveState } from "@/src/utils/state";
import {
	detectPackageManager,
	detectRuntimeFromProcess,
	formatGlobalInstallCommand,
	getGlobalInstallArgs,
	type PackageManagerName,
	type RuntimeName,
} from "@/src/core/package-manager";
import {
	selfUpdateCommandMeta,
	selfUpdateCommandSchema,
	type SelfUpdateCommandInput,
} from "./command";

function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

function encodeNpmPackageName(packageName: string): string {
	return packageName.startsWith("@")
		? packageName.replace("/", "%2F")
		: packageName;
}

interface VersionCheckResult {
	latestVersion: string | null;
	error?: string;
}

async function fetchLatestVersion(
	packageName: string,
	channel: string,
): Promise<VersionCheckResult> {
	const encodedName = encodeNpmPackageName(packageName);
	const url = `https://registry.npmjs.org/${encodedName}`;

	const controller = new AbortController();
	const timeoutHandle = setTimeout(() => controller.abort(), 5000);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: { accept: "application/json" },
		});

		if (!response.ok) {
			return {
				latestVersion: null,
				error: `Registry returned ${response.status}`,
			};
		}

		const body = (await response.json()) as { "dist-tags"?: unknown };
		if (!body || typeof body !== "object") {
			return { latestVersion: null, error: "Invalid registry response" };
		}

		const distTags = body["dist-tags"];
		if (!distTags || typeof distTags !== "object") {
			return { latestVersion: null, error: "No dist-tags in response" };
		}

		const selected =
			(distTags as Record<string, unknown>)[channel] ??
			(distTags as Record<string, unknown>).latest;

		if (typeof selected !== "string") {
			return { latestVersion: null, error: `Channel "${channel}" not found` };
		}

		const latestVersion = semver.valid(selected);
		return { latestVersion };
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			return { latestVersion: null, error: "Request timed out" };
		}
		return { latestVersion: null, error: String(error) };
	} finally {
		clearTimeout(timeoutHandle);
	}
}

function getErrorCode(error: unknown): string | undefined {
	if (typeof error !== "object" || error === null) {
		return undefined;
	}
	if (!("code" in error)) {
		return undefined;
	}
	const code = (error as Record<string, unknown>).code;
	return typeof code === "string" ? code : undefined;
}

function getCurrentChannel(currentVersion: string): string | undefined {
	const parsed = semver.parse(currentVersion);
	const pre = parsed?.prerelease?.[0];
	return typeof pre === "string" && pre.length > 0 ? pre : undefined;
}

function getSelfUpdateHints(
	env: NodeJS.ProcessEnv,
	packageManager: PackageManagerName,
	command: string,
	error: unknown,
): string[] {
	const hints: string[] = [];

	const message =
		error instanceof Error && typeof error.message === "string"
			? error.message
			: String(error);

	const errorCode = getErrorCode(error);
	if (
		/permission denied|eacces|not permitted/i.test(message) ||
		(error instanceof Error &&
			(errorCode === "EACCES" || errorCode === "EPERM"))
	) {
		hints.push(
			`Permission error while running "${command}". Ensure your global install prefix is writable (avoid sudo if possible).`,
		);
	}

	if (/command not found|not recognized as an internal|ENOENT/i.test(message)) {
		hints.push(
			`Package manager "${packageManager}" not found. Install it or rerun with --package-manager npm|pnpm|yarn|bun.`,
		);
	}

	const nvmDir = env.NVM_DIR;
	if (packageManager === "npm" && isNonEmptyString(nvmDir)) {
		hints.push(
			`Detected nvm (NVM_DIR=${nvmDir}). Make sure the intended Node version is active (e.g. "nvm use <version>") and your npm global bin is on PATH.`,
		);
	}

	const fnmDir = env.FNM_DIR;
	if (packageManager === "npm" && isNonEmptyString(fnmDir)) {
		hints.push(
			`Detected fnm (FNM_DIR=${fnmDir}). Ensure your shell has fnm env loaded (e.g. eval \"$(fnm env)\") so the correct node/npm are on PATH.`,
		);
	}

	return hints;
}

function resolveChannel(
	inputChannel: string | undefined,
	currentVersion: string,
	env: NodeJS.ProcessEnv,
): string {
	if (isNonEmptyString(inputChannel)) return inputChannel.trim();
	if (isNonEmptyString(env.PHALA_UPDATE_CHANNEL))
		return env.PHALA_UPDATE_CHANNEL;
	const configChannel = getStateValue("updateCheckChannel");
	if (isNonEmptyString(configChannel)) return configChannel;
	return getCurrentChannel(currentVersion) ?? "latest";
}

async function runSelfUpdate(
	input: SelfUpdateCommandInput,
	context: CommandContext,
): Promise<number> {
	setJsonMode(input.json);

	const packageName = context.cli?.packageName ?? "phala";
	const runtime: RuntimeName =
		(context.cli?.runtime as RuntimeName | undefined) ??
		detectRuntimeFromProcess();
	const packageManager: PackageManagerName =
		input.packageManager ?? detectPackageManager(context.env, runtime);
	const currentVersion = context.cli?.packageVersion ?? "0.0.0";
	const channel = resolveChannel(input.channel, currentVersion, context.env);

	// Fetch latest version from npm registry
	if (!input.json) {
		context.stderr.write(chalk.gray("Checking for updates...\n"));
	}

	const { latestVersion, error: fetchError } = await fetchLatestVersion(
		packageName,
		channel,
	);

	// Update the cache with fresh data
	if (latestVersion) {
		const now = Date.now();
		const channelKey = channel.replace(/[^a-zA-Z0-9_-]/g, "_");
		saveState({
			[`updateCheckLastAt_${channelKey}`]: now,
			[`updateCheckLatest_${channelKey}`]: latestVersion,
			...(channel === "latest"
				? { updateCheckLastAt: now, updateCheckLatest: latestVersion }
				: {}),
		});
	}

	const currentValid = semver.valid(currentVersion);
	const isUpToDate =
		latestVersion && currentValid && !semver.gt(latestVersion, currentValid);

	// Display version info
	if (!input.json) {
		if (fetchError) {
			context.stderr.write(
				chalk.yellow(
					`Warning: Could not fetch latest version: ${fetchError}\n`,
				),
			);
			context.stderr.write(chalk.gray(`Current version: v${currentVersion}\n`));
		} else if (latestVersion) {
			context.stderr.write(chalk.gray(`Current version: v${currentVersion}\n`));
			context.stderr.write(
				chalk.gray(
					`Latest version:  v${latestVersion}${channel !== "latest" ? ` (${channel})` : ""}\n`,
				),
			);
			if (isUpToDate) {
				context.stderr.write(
					chalk.green("You are already on the latest version.\n"),
				);
			} else {
				context.stderr.write(
					chalk.yellow(
						`Update available: v${currentVersion} → v${latestVersion}\n`,
					),
				);
			}
		}
	}

	const spec =
		channel === "latest"
			? `${packageName}@latest`
			: `${packageName}@${channel}`;
	const commandString = formatGlobalInstallCommand(packageManager, spec);
	const { command, args } = getGlobalInstallArgs(packageManager, spec);

	if (input.json && input.dryRun) {
		context.success({
			command: commandString,
			dryRun: true,
			currentVersion,
			latestVersion,
			isUpToDate,
		});
		return 0;
	}

	if (input.dryRun) {
		context.stderr.write(chalk.gray(`Command: ${commandString}\n`));
		return 0;
	}

	const canPrompt = context.stderr.isTTY === true && input.json !== true;
	if (!input.yes && !canPrompt) {
		const message =
			"Non-interactive session detected. Re-run with --yes to apply the update, or use --dry-run to print the command.\n";
		if (input.json) {
			context.success({
				command: commandString,
				ran: false,
				reason: "nonInteractive",
				currentVersion,
				latestVersion,
				isUpToDate,
			});
			return 0;
		}
		context.stderr.write(message);
		return 1;
	}

	// If already up to date, ask if user still wants to reinstall
	const promptMessage = isUpToDate
		? `Already up to date. Reinstall anyway with "${commandString}"?`
		: `Run "${commandString}"?`;

	const shouldRun =
		input.yes ||
		(await prompts({
			type: "confirm",
			name: "ok",
			message: promptMessage,
			initial: !isUpToDate,
		}).then((r) => r.ok === true));

	if (!shouldRun) {
		if (input.json) {
			context.success({
				command: commandString,
				ran: false,
				currentVersion,
				latestVersion,
				isUpToDate,
			});
		}
		return 0;
	}

	try {
		await execa(command, args, { stdio: "inherit" });
		if (input.json) {
			context.success({
				command: commandString,
				ran: true,
				currentVersion,
				latestVersion,
				isUpToDate,
			});
			return 0;
		}
		logger.success("Update completed");
		return 0;
	} catch (error) {
		const hints = getSelfUpdateHints(
			context.env,
			packageManager,
			commandString,
			error,
		);
		logger.logDetailedError(error);
		context.fail("Self update failed", {
			command: commandString,
			hints: hints.length > 0 ? hints : undefined,
		});
		if (!input.json && hints.length > 0) {
			for (const hint of hints) {
				logger.info(hint);
			}
		}
		return 1;
	}
}

export const selfUpdateCommand = defineCommand({
	path: ["self", "update"],
	meta: selfUpdateCommandMeta,
	schema: selfUpdateCommandSchema,
	handler: runSelfUpdate,
});
