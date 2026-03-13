import chalk from "chalk";
import {
	safeGetCvmInfo,
	safeGetAppDeviceAllowlist,
	safeGetAvailableNodes,
	safeAddDevice,
	safeRemoveDevice,
	safeSetAllowAnyDevice,
	getAllowedDevices,
	SUPPORTED_CHAINS,
	type AddDevice,
	type RemoveDevice,
	type SetAllowAnyDevice,
} from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getClient } from "@/src/lib/client";
import { printTable } from "@/src/lib/table";
import { logger } from "@/src/utils/logger";
import {
	cvmsDevicesGroup,
	cvmsDevicesListMeta,
	cvmsDevicesListSchema,
	type CvmsDevicesListInput,
	cvmsDevicesAddMeta,
	cvmsDevicesAddSchema,
	type CvmsDevicesAddInput,
	cvmsDevicesRemoveMeta,
	cvmsDevicesRemoveSchema,
	type CvmsDevicesRemoveInput,
	cvmsDevicesAllowAnyMeta,
	cvmsDevicesAllowAnySchema,
	type CvmsDevicesAllowAnyInput,
	cvmsDevicesDisallowAnyMeta,
	cvmsDevicesDisallowAnySchema,
	type CvmsDevicesDisallowAnyInput,
	cvmsDevicesToggleAllowAnyMeta,
	cvmsDevicesToggleAllowAnySchema,
	type CvmsDevicesToggleAllowAnyInput,
} from "./command";

// ── Helpers ─────────────────────────────────────────────────────────

const DEVICE_ID_REGEX = /^(0x)?[0-9a-fA-F]{64}$/;

function normalizeDeviceId(deviceId: string): `0x${string}` {
	const normalized = deviceId.startsWith("0x") ? deviceId : `0x${deviceId}`;
	return normalized.toLowerCase() as `0x${string}`;
}

function isValidDeviceId(deviceId: string): boolean {
	return DEVICE_ID_REGEX.test(deviceId);
}

function txExplorerUrl(
	chain: (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS],
	txHash: string | undefined,
): string | null {
	if (!txHash) return null;
	const baseUrl = chain.blockExplorers?.default?.url;
	if (!baseUrl) return null;
	return `${baseUrl}/tx/${txHash}`;
}

async function waitForAllowlistState(params: {
	chain: (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];
	rpcUrl?: string;
	appAddress: `0x${string}`;
	deviceIds: string[];
	condition: (result: Awaited<ReturnType<typeof getAllowedDevices>>) => boolean;
	description: string;
	timeoutMs?: number;
	intervalMs?: number;
}): Promise<boolean> {
	const { chain, rpcUrl, appAddress, deviceIds, condition, description } =
		params;
	const timeoutMs = params.timeoutMs ?? 60_000;
	const intervalMs = params.intervalMs ?? 2_000;
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		const result = await getAllowedDevices({
			chain,
			rpcUrl,
			appAddress,
			deviceIds,
		});
		if (condition(result)) {
			return true;
		}
		await new Promise((resolve) => {
			setTimeout(resolve, intervalMs);
		});
	}

	logger.warn(`Timeout waiting for on-chain state: ${description}`);
	return false;
}

async function resolveDeviceIdOrNodeName(
	input: { cvmId?: string; deviceId?: string },
	context: CommandContext,
): Promise<`0x${string}`> {
	let deviceInput = input.deviceId;
	// Support omitting <cvm> when phala.toml provides it: first positional becomes device/node.
	if (!deviceInput && input.cvmId && context.cvmId) {
		deviceInput = input.cvmId;
	}

	if (!deviceInput) {
		throw new Error("Device ID or node name is required.");
	}

	if (isValidDeviceId(deviceInput)) {
		return normalizeDeviceId(deviceInput);
	}

	if (deviceInput.startsWith("0x")) {
		throw new Error(
			`Invalid device ID format: ${deviceInput}. Expected 32-byte hex (0x + 64 hex chars).`,
		);
	}

	const client = await getClient();
	const nodesResult = await safeGetAvailableNodes(client);
	if (!nodesResult.success) {
		throw new Error(
			`Failed to resolve node name "${deviceInput}": ${nodesResult.error.message}`,
		);
	}

	const matches = nodesResult.data.nodes.filter(
		(node) => node.name.toLowerCase() === deviceInput.toLowerCase(),
	);
	if (matches.length === 0) {
		throw new Error(
			`Node "${deviceInput}" not found. Provide a valid node name or device ID.`,
		);
	}
	if (matches.length > 1) {
		throw new Error(
			`Node name "${deviceInput}" is ambiguous (${matches.length} matches). Use an explicit device ID.`,
		);
	}

	const resolvedDeviceId = matches[0].device_id;
	if (!resolvedDeviceId || !isValidDeviceId(resolvedDeviceId)) {
		throw new Error(
			`Node "${matches[0].name}" has no valid device_id. Use an explicit device ID.`,
		);
	}
	return normalizeDeviceId(resolvedDeviceId);
}

async function resolveAppContract(context: CommandContext) {
	if (!context.cvmId) {
		context.fail(
			"No CVM ID provided. Use --interactive to select interactively.",
		);
		return null;
	}

	const client = await getClient();

	const infoResult = await safeGetCvmInfo(client, context.cvmId);
	if (!infoResult.success) {
		context.fail(infoResult.error.message);
		return null;
	}

	const cvm = infoResult.data;
	if (!cvm) {
		context.fail("CVM not found");
		return null;
	}

	const appId = cvm.app_id;
	if (!appId) {
		context.fail("CVM has no app_id assigned yet.");
		return null;
	}

	const allowlistResult = await safeGetAppDeviceAllowlist(client, { appId });
	if (!allowlistResult.success) {
		context.fail(allowlistResult.error.message);
		return null;
	}

	const allowlist = allowlistResult.data;
	if (!allowlist.is_onchain_kms) {
		context.fail(
			"This app does not use on-chain KMS. Device management requires an on-chain KMS.",
		);
		return null;
	}

	if (!allowlist.chain_id || !allowlist.app_contract_address) {
		context.fail(
			"Missing chain_id or app_contract_address in allowlist response.",
		);
		return null;
	}

	const chain = SUPPORTED_CHAINS[allowlist.chain_id];
	if (!chain) {
		context.fail(`Unsupported chain_id: ${allowlist.chain_id}`);
		return null;
	}

	return {
		chain,
		chainId: allowlist.chain_id,
		appContractAddress: allowlist.app_contract_address as `0x${string}`,
		allowlist,
	};
}

function resolvePrivateKey(input: { privateKey?: string }): string {
	const key = input.privateKey || process.env.PRIVATE_KEY;
	if (!key) {
		throw new Error(
			"Private key required. Use --private-key or set PRIVATE_KEY env var.",
		);
	}
	return key.startsWith("0x") ? key : `0x${key}`;
}

// ── list ────────────────────────────────────────────────────────────

async function runList(
	input: CvmsDevicesListInput,
	context: CommandContext,
): Promise<number> {
	try {
		const resolved = await resolveAppContract(context);
		if (!resolved) return 1;

		const { chain, appContractAddress, allowlist } = resolved;

		if (input.json) {
			context.success({
				appAddress: appContractAddress,
				allowAnyDevice: allowlist.allow_any_device ?? false,
				devices: allowlist.devices.map((d) => ({
					deviceId: d.device_id,
					nodeName: d.node_name,
					status: d.status,
				})),
			});
			return 0;
		}

		logger.info(`Contract: ${appContractAddress}  Chain: ${chain.name}`);
		logger.info(
			`Allow Any Device: ${allowlist.allow_any_device ? chalk.green("yes") : chalk.red("no")}`,
		);

		if (allowlist.devices.length === 0) {
			logger.info("No devices found");
			return 0;
		}

		const columns = ["DEVICE_ID", "NODE", "STATUS"] as const;
		const rows = allowlist.devices.map((d) => ({
			DEVICE_ID: d.device_id,
			NODE: d.node_name ?? "-",
			STATUS:
				d.status === "allowed" ? chalk.green(d.status) : chalk.red(d.status),
		}));

		printTable(columns, rows);

		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

// ── add ─────────────────────────────────────────────────────────────

async function runAdd(
	input: CvmsDevicesAddInput,
	context: CommandContext,
): Promise<number> {
	try {
		const resolved = await resolveAppContract(context);
		if (!resolved) return 1;

		const { chain, appContractAddress } = resolved;
		const privateKey = resolvePrivateKey(input);
		const deviceId = await resolveDeviceIdOrNodeName(input, context);

		const result = await safeAddDevice({
			chain,
			rpcUrl: input.rpcUrl,
			appAddress: appContractAddress,
			deviceId,
			privateKey: privateKey as `0x${string}`,
		});

		if (!result.success) {
			const err = result as { success: false; error: { message: string } };
			context.fail(err.error.message);
			return 1;
		}

		const data = result.data as AddDevice;
		const explorerUrl = txExplorerUrl(chain, data.transactionHash);

		if (input.json) {
			context.success({
				...data,
				deviceId,
				explorer: explorerUrl ?? undefined,
			});
			return 0;
		}

		logger.success("Device added successfully!");
		logger.info(`Device ID:   ${deviceId}`);
		logger.info(`Transaction: ${data.transactionHash}`);
		if (explorerUrl) {
			logger.info(`Explorer:    ${explorerUrl}`);
		}

		if (input.wait) {
			const ok = await waitForAllowlistState({
				chain,
				rpcUrl: input.rpcUrl,
				appAddress: appContractAddress,
				deviceIds: [deviceId],
				description: `device ${deviceId} to be allowed`,
				condition: (state) =>
					state.devices.some((d) => d.toLowerCase() === deviceId.toLowerCase()),
			});
			if (!ok) {
				context.fail(
					`Device ${deviceId} not observed on-chain within timeout.`,
				);
				return 1;
			}
			logger.success("On-chain allowlist updated.");
		} else {
			logger.info(
				"Backend allowlist API may lag behind chain. Use --wait to verify via RPC.",
			);
		}

		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

// ── remove ──────────────────────────────────────────────────────────

async function runRemove(
	input: CvmsDevicesRemoveInput,
	context: CommandContext,
): Promise<number> {
	try {
		const resolved = await resolveAppContract(context);
		if (!resolved) return 1;

		const { chain, appContractAddress } = resolved;
		const privateKey = resolvePrivateKey(input);
		const deviceId = await resolveDeviceIdOrNodeName(input, context);

		const result = await safeRemoveDevice({
			chain,
			rpcUrl: input.rpcUrl,
			appAddress: appContractAddress,
			deviceId,
			privateKey: privateKey as `0x${string}`,
		});

		if (!result.success) {
			const err = result as { success: false; error: { message: string } };
			context.fail(err.error.message);
			return 1;
		}

		const data = result.data as RemoveDevice;
		const explorerUrl = txExplorerUrl(chain, data.transactionHash);

		if (input.json) {
			context.success({
				...data,
				deviceId,
				explorer: explorerUrl ?? undefined,
			});
			return 0;
		}

		logger.success("Device removed successfully!");
		logger.info(`Device ID:   ${deviceId}`);
		logger.info(`Transaction: ${data.transactionHash}`);
		if (explorerUrl) {
			logger.info(`Explorer:    ${explorerUrl}`);
		}

		if (input.wait) {
			const ok = await waitForAllowlistState({
				chain,
				rpcUrl: input.rpcUrl,
				appAddress: appContractAddress,
				deviceIds: [deviceId],
				description: `device ${deviceId} to be removed`,
				condition: (state) =>
					!state.devices.some(
						(d) => d.toLowerCase() === deviceId.toLowerCase(),
					),
			});
			if (!ok) {
				context.fail(
					`Device ${deviceId} still appears on-chain after timeout.`,
				);
				return 1;
			}
			logger.success("On-chain allowlist updated.");
		} else {
			logger.info(
				"Backend allowlist API may lag behind chain. Use --wait to verify via RPC.",
			);
		}

		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

// ── allow-any ───────────────────────────────────────────────────────

async function runAllowAny(
	input: CvmsDevicesAllowAnyInput,
	context: CommandContext,
): Promise<number> {
	if (input.enable && input.disable) {
		context.fail("Cannot use both --enable and --disable.");
		return 1;
	}

	const allow = !input.disable;

	try {
		const resolved = await resolveAppContract(context);
		if (!resolved) return 1;

		return await executeSetAllowAny(input, context, {
			chain: resolved.chain,
			appContractAddress: resolved.appContractAddress,
			allow,
		});
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

async function runDisallowAny(
	input: CvmsDevicesDisallowAnyInput,
	context: CommandContext,
): Promise<number> {
	try {
		const resolved = await resolveAppContract(context);
		if (!resolved) return 1;

		return await executeSetAllowAny(input, context, {
			chain: resolved.chain,
			appContractAddress: resolved.appContractAddress,
			allow: false,
		});
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

async function runToggleAllowAny(
	input: CvmsDevicesToggleAllowAnyInput,
	context: CommandContext,
): Promise<number> {
	if (input.enable && input.disable) {
		context.fail("Cannot use both --enable and --disable.");
		return 1;
	}

	try {
		const resolved = await resolveAppContract(context);
		if (!resolved) return 1;

		const allow =
			input.enable === true
				? true
				: input.disable === true
					? false
					: !resolved.allowlist.allow_any_device;

		return await executeSetAllowAny(input, context, {
			chain: resolved.chain,
			appContractAddress: resolved.appContractAddress,
			allow,
		});
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

async function executeSetAllowAny(
	input: {
		privateKey?: string;
		rpcUrl?: string;
		wait?: boolean;
		json?: boolean;
	},
	context: CommandContext,
	params: {
		chain: (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];
		appContractAddress: `0x${string}`;
		allow: boolean;
	},
): Promise<number> {
	const { chain, appContractAddress, allow } = params;
	const privateKey = resolvePrivateKey(input);

	const result = await safeSetAllowAnyDevice({
		chain,
		rpcUrl: input.rpcUrl,
		appAddress: appContractAddress,
		allow,
		privateKey: privateKey as `0x${string}`,
	});

	if (!result.success) {
		const err = result as { success: false; error: { message: string } };
		context.fail(err.error.message);
		return 1;
	}

	const data = result.data as SetAllowAnyDevice;
	const explorerUrl = txExplorerUrl(chain, data.transactionHash);

	if (input.json) {
		context.success({
			...data,
			explorer: explorerUrl ?? undefined,
		});
		return 0;
	}

	logger.success(
		`Allow-any-device ${allow ? "enabled" : "disabled"} successfully!`,
	);
	logger.info(`Transaction: ${data.transactionHash}`);
	if (explorerUrl) {
		logger.info(`Explorer:    ${explorerUrl}`);
	}

	if (input.wait) {
		const ok = await waitForAllowlistState({
			chain,
			rpcUrl: input.rpcUrl,
			appAddress: appContractAddress,
			deviceIds: [],
			description: `allowAnyDevice=${allow}`,
			condition: (state) => state.allowAnyDevice === allow,
		});
		if (!ok) {
			context.fail(`allowAnyDevice did not become ${allow} within timeout.`);
			return 1;
		}
		logger.success("On-chain allow-any state updated.");
	} else {
		logger.info(
			"Backend allowlist API may lag behind chain. Use --wait to verify via RPC.",
		);
	}

	return 0;
}

// ── Command definitions ─────────────────────────────────────────────

export const cvmsDevicesListCommand = defineCommand({
	path: ["cvms", "devices", "list"],
	meta: cvmsDevicesListMeta,
	schema: cvmsDevicesListSchema,
	handler: runList,
});

export const cvmsDevicesAddCommand = defineCommand({
	path: ["cvms", "devices", "add"],
	meta: cvmsDevicesAddMeta,
	schema: cvmsDevicesAddSchema,
	handler: runAdd,
});

export const cvmsDevicesRemoveCommand = defineCommand({
	path: ["cvms", "devices", "remove"],
	meta: cvmsDevicesRemoveMeta,
	schema: cvmsDevicesRemoveSchema,
	handler: runRemove,
});

export const cvmsDevicesAllowAnyCommand = defineCommand({
	path: ["cvms", "devices", "allow-any"],
	meta: cvmsDevicesAllowAnyMeta,
	schema: cvmsDevicesAllowAnySchema,
	handler: runAllowAny,
});

export const cvmsDevicesDisallowAnyCommand = defineCommand({
	path: ["cvms", "devices", "disallow-any"],
	meta: cvmsDevicesDisallowAnyMeta,
	schema: cvmsDevicesDisallowAnySchema,
	handler: runDisallowAny,
});

export const cvmsDevicesToggleAllowAnyCommand = defineCommand({
	path: ["cvms", "devices", "toggle-allow-any"],
	meta: cvmsDevicesToggleAllowAnyMeta,
	schema: cvmsDevicesToggleAllowAnySchema,
	handler: runToggleAllowAny,
});

export const cvmsDevicesCommands = {
	group: cvmsDevicesGroup,
	commands: [
		cvmsDevicesListCommand,
		cvmsDevicesAddCommand,
		cvmsDevicesRemoveCommand,
		cvmsDevicesAllowAnyCommand,
		cvmsDevicesDisallowAnyCommand,
		cvmsDevicesToggleAllowAnyCommand,
	],
};

export default cvmsDevicesCommands;
