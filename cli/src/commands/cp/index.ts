import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import chalk from "chalk";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getClient } from "@/src/lib/client";
import { logger } from "@/src/utils/logger";
import { parse_cvm_id } from "@/src/utils/project-config";
import { cpCommandMeta, cpCommandSchema, type CpCommandInput } from "./command";

interface PathInfo {
	isRemote: boolean;
	cvmId?: string;
	path: string;
}

function parsePath(pathStr: string): PathInfo {
	const remoteMatch = pathStr.match(/^([^:]+):(.+)$/);
	if (remoteMatch) {
		return {
			isRemote: true,
			cvmId: remoteMatch[1],
			path: remoteMatch[2],
		};
	}
	return {
		isRemote: false,
		path: pathStr,
	};
}

async function runCpCommand(
	input: CpCommandInput,
	context: CommandContext,
): Promise<number> {
	try {
		const source = parsePath(input.source);
		const destination = parsePath(input.destination);

		// Validate: exactly one side must be remote
		if (source.isRemote === destination.isRemote) {
			logger.error(
				"Either source or destination must be a remote path in format: cvm-id:path",
			);
			logger.info("Examples:");
			logger.info("  phala cp ./local.txt app_123:/root/remote.txt");
			logger.info("  phala cp app_123:/root/remote.txt ./local.txt");
			return 1;
		}

		// Get CVM ID from remote path or fallback to project config
		const remotePath = source.isRemote ? source : destination;
		const cvmId =
			parse_cvm_id(remotePath.cvmId) ?? context.projectConfig.cvm_id;

		if (!cvmId) {
			logger.error(
				"No CVM ID provided. Either use format cvm-id:path or configure it in phala.toml.\n" +
					"Supported fields: id, uuid, app_id, or instance_id",
			);
			return 1;
		}

		// Resolve gateway domain: CLI option > project config > API
		let gatewayDomain =
			input.gatewayDomain ?? context.projectConfig.gateway_domain;

		// Resolve port: CLI option > project config > default (443)
		let port =
			input.port !== "443"
				? input.port
				: (context.projectConfig.gateway_port?.toString() ?? "443");

		// Parse gateway domain to extract hostname and port if included
		let gatewayHost = gatewayDomain;
		let gatewayPort: string | undefined;

		if (gatewayDomain) {
			// Check if gateway domain includes port (format: hostname:port)
			const lastColonIndex = gatewayDomain.lastIndexOf(":");
			if (lastColonIndex > 0) {
				const potentialPort = gatewayDomain.substring(lastColonIndex + 1);
				// Verify it's a valid port number
				if (/^\d+$/.test(potentialPort)) {
					gatewayHost = gatewayDomain.substring(0, lastColonIndex);
					gatewayPort = potentialPort;
					// Use gateway's port if no explicit port was specified via CLI
					if (input.port === "443") {
						port = gatewayPort;
					}
				}
			}
		}

		let instanceId: string;

		// Only fetch CVM info if we don't have gateway domain
		// (which also serves as a status check and validates the CVM exists)
		if (!gatewayDomain) {
			const client = await getClient();
			const cvm = await client.getCvmInfo({ id: cvmId });

			if (!cvm.gateway_domain) {
				logger.error("CVM is not registered on any gateway.");
				return 1;
			}

			// Check if CVM is running
			if (cvm.status !== "running") {
				logger.error(
					`CVM is not running (current status: ${chalk.yellow(cvm.status)})`,
				);
				logger.info("Please start the CVM first using: phala cvms start");
				return 1;
			}

			gatewayDomain = cvm.gateway_domain;
			// Use app_id from API response (without app_ prefix)
			instanceId = cvm.app_id;

			// Re-parse gateway domain after getting it from API
			gatewayHost = gatewayDomain;
			if (gatewayDomain) {
				const lastColonIndex = gatewayDomain.lastIndexOf(":");
				if (lastColonIndex > 0) {
					const potentialPort = gatewayDomain.substring(lastColonIndex + 1);
					if (/^\d+$/.test(potentialPort)) {
						gatewayHost = gatewayDomain.substring(0, lastColonIndex);
						gatewayPort = potentialPort;
						if (input.port === "443") {
							port = gatewayPort;
						}
					}
				}
			}
		} else {
			// When skipping API call, extract raw app_id from cvmId
			// cvmId could be: "app_xxx" (need to remove prefix) or "xxx" (UUID without dashes)
			if (cvmId.startsWith("app_")) {
				instanceId = cvmId.substring(4); // Remove "app_" prefix
			} else {
				// For UUID or other formats, use as-is
				instanceId = cvmId;
			}
		}

		// Handle SSH key file
		let keyFile = input.identity;

		if (!keyFile) {
			// Search for default keys
			const defaultKeys = [
				join(homedir(), ".ssh", "id_rsa"),
				join(homedir(), ".ssh", "id_ed25519"),
				join(homedir(), ".ssh", "id_ecdsa"),
				join(homedir(), ".ssh", "id_dsa"),
			];

			for (const key of defaultKeys) {
				if (existsSync(key)) {
					keyFile = key;
					break;
				}
			}

			if (!keyFile) {
				logger.warn(
					"No default SSH key found. SCP will use ssh-agent or prompt for password.",
				);
			}
		} else {
			// Expand ~ to home directory
			if (keyFile.startsWith("~")) {
				keyFile = join(homedir(), keyFile.slice(1));
			}

			// Verify key file exists
			if (!existsSync(keyFile)) {
				logger.error(`SSH key file not found: ${keyFile}`);
				return 1;
			}
		}

		// Construct remote hostname
		// Use gatewayHost (without port) to construct hostname
		const hostname = `${instanceId}-22.${gatewayHost}`;
		const user = "root";

		// Suppress openssl certificate verification output in non-verbose mode
		const proxyCommand = input.verbose
			? "openssl s_client -quiet -connect %h:%p"
			: "openssl s_client -quiet -connect %h:%p 2>/dev/null";

		if (input.verbose) {
			logger.info(`Connecting to ${chalk.cyan(hostname)}...`);
		}

		// Build SCP arguments
		const scpArgs: string[] = [
			"-o",
			`ProxyCommand=${proxyCommand}`,
			"-o",
			"StrictHostKeyChecking=no",
			"-o",
			"UserKnownHostsFile=/dev/null",
			"-o",
			"LogLevel=ERROR",
			"-P",
			port,
		];

		// Add key file if available
		if (keyFile) {
			scpArgs.push("-i", keyFile);
		}

		// Add recursive flag if requested
		if (input.recursive) {
			scpArgs.push("-r");
		}

		// Add verbose flag if requested
		if (input.verbose) {
			scpArgs.unshift("-v");
			// Remove LogLevel restriction in verbose mode
			const logLevelIndex = scpArgs.indexOf("LogLevel=ERROR");
			if (logLevelIndex > 0) {
				scpArgs.splice(logLevelIndex - 1, 2); // Remove -o and LogLevel=ERROR
			}
		}

		// Construct source and destination with proper format
		const scpSource = source.isRemote
			? `${user}@${hostname}:${source.path}`
			: source.path;
		const scpDestination = destination.isRemote
			? `${user}@${hostname}:${destination.path}`
			: destination.path;

		scpArgs.push(scpSource, scpDestination);

		const direction = source.isRemote ? "download" : "upload";
		const localPath = source.isRemote ? destination.path : source.path;
		const remotePath_ = source.isRemote ? source.path : destination.path;

		logger.info(
			`${direction === "upload" ? "Uploading" : "Downloading"} ${chalk.cyan(localPath)} ${direction === "upload" ? "to" : "from"} ${chalk.cyan(remotePath_)}...`,
		);

		// Spawn SCP process
		const scp = spawn("scp", scpArgs, { stdio: "inherit" });

		// Handle process errors
		scp.on("error", (error) => {
			logger.break();
			logger.error(`SCP failed: ${error.message}`);
		});

		// Handle process exit
		return new Promise<number>((resolve) => {
			scp.on("close", (code) => {
				logger.break();
				if (code === 0) {
					logger.success(
						`${direction === "upload" ? "Upload" : "Download"} completed`,
					);
					resolve(0);
				} else {
					logger.error(`Transfer failed with code ${code}`);
					resolve(code ?? 1);
				}
			});
		});
	} catch (error) {
		logger.error("Failed to copy file via SCP");
		if (error instanceof Error) {
			logger.error(error.message);
		}
		return 1;
	}
}

export const cpCommand = defineCommand({
	path: ["cp"],
	meta: cpCommandMeta,
	schema: cpCommandSchema,
	handler: runCpCommand,
});

export default cpCommand;
