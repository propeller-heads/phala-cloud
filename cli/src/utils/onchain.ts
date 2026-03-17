import {
	type Chain,
	type PublicClient,
	type WalletClient,
	createPublicClient,
	createWalletClient,
	http,
} from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import {
	safeGetCvmInfo,
	safeGetAppDeviceAllowlist,
	SUPPORTED_CHAINS,
} from "@phala/cloud";
import type { CommandContext } from "@/src/core/types";
import { getClient } from "@/src/lib/client";

export function txExplorerUrl(
	chain: (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS],
	txHash: string | undefined,
): string | null {
	if (!txHash) return null;
	const baseUrl = chain.blockExplorers?.default?.url;
	if (!baseUrl) return null;
	return `${baseUrl}/tx/${txHash}`;
}

export function resolvePrivateKey(input: {
	privateKey?: string;
}): `0x${string}` {
	const key = input.privateKey || process.env.PRIVATE_KEY;
	if (!key) {
		throw new Error(
			"Private key required. Use --private-key or set PRIVATE_KEY env var.",
		);
	}
	return (key.startsWith("0x") ? key : `0x${key}`) as `0x${string}`;
}

export function createSharedClients(
	chain: Chain,
	privateKey: `0x${string}`,
	rpcUrl?: string,
) {
	const account = privateKeyToAccount(privateKey, { nonceManager });
	const publicClient = createPublicClient({
		chain,
		transport: http(rpcUrl),
	}) as unknown as PublicClient;
	const walletClient = createWalletClient({
		account,
		chain,
		transport: http(rpcUrl),
	}) as unknown as WalletClient;
	return { publicClient, walletClient };
}

export async function resolveAppContract(
	cvmIdentifier: string,
	context: CommandContext,
) {
	const client = await getClient();

	const infoResult = await safeGetCvmInfo(client, { id: cvmIdentifier });
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
			"This app does not use on-chain KMS. This operation requires an on-chain KMS.",
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
