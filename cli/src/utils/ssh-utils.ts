import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { basename, join } from "node:path";
import type { Client } from "@phala/cloud";
import chalk from "chalk";
import { logger } from "./logger";

/**
 * Custom error for CVM not running
 */
export class CvmNotRunningError extends Error {
	constructor(
		public readonly status: string,
		public readonly cvmId: string,
	) {
		super(`CVM is not running (current status: ${chalk.yellow(status)})`);
		this.name = "CvmNotRunningError";
	}
}

/**
 * Custom error for missing gateway
 */
export class NoGatewayError extends Error {
	constructor(public readonly cvmId: string) {
		super("CVM is not registered on any gateway.");
		this.name = "NoGatewayError";
	}
}

/**
 * Parsed gateway domain (hostname and optional port)
 */
export type Gateway = { host: string; port?: string };

/**
 * Parse gateway domain to extract hostname and port
 * Examples: "example.com" -> { host: "example.com" }
 *           "example.com:8443" -> { host: "example.com", port: "8443" }
 */
export function parseGatewayDomain(gatewayDomain: string): Gateway {
	const lastColonIndex = gatewayDomain.lastIndexOf(":");
	if (lastColonIndex > 0) {
		const potentialPort = gatewayDomain.substring(lastColonIndex + 1);
		if (/^\d+$/.test(potentialPort)) {
			return {
				host: gatewayDomain.substring(0, lastColonIndex),
				port: potentialPort,
			};
		}
	}
	return { host: gatewayDomain };
}

/**
 * Find default SSH private key file
 */
export function findDefaultSshKey(): string | undefined {
	const defaultKeys = [
		join(homedir(), ".ssh", "id_rsa"),
		join(homedir(), ".ssh", "id_ed25519"),
		join(homedir(), ".ssh", "id_ecdsa"),
		join(homedir(), ".ssh", "id_dsa"),
	];

	for (const key of defaultKeys) {
		if (existsSync(key)) {
			return key;
		}
	}

	return undefined;
}

/**
 * Get SSH key file - either user-specified or default
 * Throws if specified key doesn't exist
 */
export function getSshKeyFile(specifiedKey?: string): string | undefined {
	if (specifiedKey) {
		// Expand ~ to home directory
		const resolvedPath = specifiedKey.startsWith("~")
			? join(homedir(), specifiedKey.slice(1))
			: specifiedKey;

		if (!existsSync(resolvedPath)) {
			throw new Error(`SSH key file not found: ${resolvedPath}`);
		}
		return resolvedPath;
	}

	return findDefaultSshKey();
}

/**
 * Check if the base image is a dev image (contains "dev" in the name)
 */
export function isDevImage(baseImage: string | null | undefined): boolean {
	if (!baseImage) {
		return false;
	}
	return baseImage.toLowerCase().includes("dev");
}

/**
 * Fetch CVM info from API and validate it's ready for connection
 * @throws {NoGatewayError} if CVM has no gateway
 * @throws {CvmNotRunningError} if CVM is not running
 */
export async function fetchCvmInfo(client: Client, cvmId: string) {
	const cvm = await client.getCvmInfo({ id: cvmId });

	if (!cvm.gateway_domain) {
		throw new NoGatewayError(cvmId);
	}

	if (cvm.status !== "running") {
		throw new CvmNotRunningError(cvm.status, cvmId);
	}

	return {
		appId: cvm.app_id,
		gatewayDomain: cvm.gateway_domain,
		status: cvm.status,
		baseImage: cvm.base_image,
	};
}

/**
 * Build hostname for SSH/SCP connection
 * Format: {instanceId}-22.{gatewayHost}
 */
export function buildHostname(instanceId: string, gatewayHost: string): string {
	return `${instanceId}-22.${gatewayHost}`;
}

/**
 * Select port with priority: user-specified > gateway port > default
 */
export function selectPort(
	requestedPort: string,
	gatewayPort: string | undefined,
): string {
	// If user explicitly specified a non-default port, use it
	if (requestedPort !== "443") {
		return requestedPort;
	}
	// Otherwise prefer gateway's port if available
	return gatewayPort || "443";
}

/**
 * Escape a string for safe use in shell commands.
 * Uses single quotes and escapes any embedded single quotes.
 */
export function shellEscape(arg: string): string {
	// If the arg contains no special characters, return as-is
	if (/^[a-zA-Z0-9_./:@=-]+$/.test(arg)) {
		return arg;
	}
	// Escape single quotes by ending the quoted string, adding escaped quote, and resuming
	// e.g., "it's" becomes 'it'\''s'
	return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Check if the system openssl is LibreSSL
 */
export function isLibreSSL(): boolean {
	try {
		const output = execSync("openssl version", { encoding: "utf-8" });
		return output.toLowerCase().includes("libressl");
	} catch {
		return false;
	}
}

/**
 * Check if a key file is an ed25519 key
 */
export function isEd25519Key(keyPath: string): boolean {
	const keyName = basename(keyPath).toLowerCase();
	if (keyName.includes("ed25519")) {
		return true;
	}

	try {
		const content = readFileSync(keyPath, "utf-8");
		// Check for ed25519 in the key content (OpenSSH format)
		return content.includes("ssh-ed25519") || content.includes("ED25519");
	} catch {
		return false;
	}
}

/**
 * Check for LibreSSL + ed25519 compatibility issue on macOS
 * and warn the user if detected
 */
export function checkLibreSSLEd25519Compatibility(keyPath: string): void {
	if (platform() !== "darwin") {
		return;
	}

	if (!isLibreSSL()) {
		return;
	}

	if (!isEd25519Key(keyPath)) {
		return;
	}

	logger.warn(
		"Detected LibreSSL with ed25519 key on macOS. This combination may cause SSH connection issues.",
	);
	logger.info(
		`If·you·experience·problems,·install·OpenSSL·via·Homebrew:·${chalk.cyan("brew·install·openssl")}`,
	);
	logger.info("Then ensure Homebrew's OpenSSL is in your PATH before /usr/bin");
}

/**
 * Build common SSH options for ssh/scp commands
 */
export function buildSshOptions(verbose: boolean, timeout: string): string[] {
	const proxyCommand = verbose
		? "openssl s_client -quiet -connect %h:%p"
		: "openssl s_client -quiet -connect %h:%p 2>/dev/null";

	return [
		"-o",
		`ProxyCommand=${proxyCommand}`,
		"-o",
		"StrictHostKeyChecking=no",
		"-o",
		"UserKnownHostsFile=/dev/null",
		"-o",
		`ConnectTimeout=${timeout}`,
	];
}
