import { spawn } from "node:child_process";
import chalk from "chalk";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getClient } from "@/src/lib/client";
import { logger } from "@/src/utils/logger";
import {
	CvmNotRunningError,
	NoGatewayError,
	buildHostname,
	buildSshOptions,
	fetchCvmInfo,
	getSshKeyFile,
	parseGatewayDomain,
	selectPort,
} from "@/src/utils/ssh-utils";
import {
	sshCommandMeta,
	sshCommandSchema,
	type SshCommandInput,
} from "./command";

async function runSshCommand(
	input: SshCommandInput,
	context: CommandContext,
): Promise<number> {
	try {
		// Get CVM ID from context (already resolved with priority: interactive > --cvm-id > phala.toml)
		const cvmId =
			context.cvmId?.id ||
			context.cvmId?.uuid ||
			context.cvmId?.app_id ||
			context.cvmId?.instance_id;

		if (!cvmId) {
			logger.error(
				"No CVM ID provided. Either pass a CVM ID as argument or configure it in phala.toml.\n" +
					"Supported fields: id, uuid, app_id, or instance_id",
			);
			return 1;
		}

		// Resolve gateway domain and port from config hierarchy
		const configGatewayDomain =
			input.gatewayDomain ?? context.projectConfig.gateway_domain;
		const requestedPort =
			input.port !== "443"
				? input.port
				: (context.projectConfig.gateway_port?.toString() ?? "443");

		// Fetch CVM info from API if gateway not provided
		let instanceId: string;
		let gatewayDomain: string;

		if (!configGatewayDomain) {
			try {
				const client = await getClient();
				const cvmInfo = await fetchCvmInfo(client, cvmId);
				instanceId = cvmInfo.appId;
				gatewayDomain = cvmInfo.gatewayDomain;
			} catch (error) {
				if (error instanceof NoGatewayError) {
					logger.error(error.message);
				} else if (error instanceof CvmNotRunningError) {
					logger.error(error.message);
					logger.info("Please start the CVM first using: phala cvms start");
				} else {
					logger.error(
						error instanceof Error ? error.message : "Failed to fetch CVM info",
					);
				}
				return 1;
			}
		} else {
			gatewayDomain = configGatewayDomain;
			// Extract instance ID from cvmId (remove "app_" prefix if present)
			instanceId = cvmId.startsWith("app_") ? cvmId.substring(4) : cvmId;
		}

		// Parse gateway and select port
		const gateway = parseGatewayDomain(gatewayDomain);
		const port = selectPort(requestedPort, gateway.port);
		const hostname = buildHostname(instanceId, gateway.host);

		// Get SSH key file
		const keyFile = getSshKeyFile(input.identity);
		if (!keyFile) {
			logger.warn(
				"No default SSH key found. SSH will use ssh-agent or prompt for password.",
			);
		}

		if (input.verbose) {
			logger.info(`Connecting to ${chalk.cyan(hostname)}:${port}...`);
		}

		// Build SSH arguments
		const sshOptions = buildSshOptions(input.verbose, input.timeout);
		const sshArgs: string[] = [...sshOptions, "-p", port];

		if (input.verbose) {
			sshArgs.unshift("-v");
		}

		if (keyFile) {
			sshArgs.push("-i", keyFile);
		}

		sshArgs.push(`root@${hostname}`);

		// Spawn SSH process
		const ssh = spawn("ssh", sshArgs, { stdio: "inherit" });

		// Handle process errors
		ssh.on("error", (error) => {
			logger.break();
			logger.error(`SSH connection failed: ${error.message}`);
		});

		// Handle process exit
		return new Promise<number>((resolve) => {
			ssh.on("close", (code) => {
				logger.break();
				if (code === 0) {
					logger.success("Connection closed");
					resolve(0);
				} else {
					logger.error(`Connection failed with code ${code}`);
					resolve(code ?? 1);
				}
			});
		});
	} catch (error) {
		logger.error("Failed to connect via SSH");
		if (error instanceof Error) {
			logger.error(error.message);
		} else {
			logger.error(String(error));
		}
		return 1;
	}
}

export const sshCommand = defineCommand({
	path: ["ssh"],
	meta: sshCommandMeta,
	schema: sshCommandSchema,
	handler: runSshCommand,
});

export default sshCommand;
