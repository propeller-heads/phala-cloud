import { encodeFunctionData, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { logger } from "@/src/utils/logger";
import { resolveAppContract, resolvePrivateKey } from "@/src/utils/onchain";
import { computeComposeHash } from "@/src/commands/compose-hash";
import {
	safeProposeUpdateMeta,
	safeProposeUpdateSchema,
	type SafeProposeUpdateInput,
} from "./command";

const addComposeHashAbi = [
	{
		inputs: [{ name: "composeHash", type: "bytes32" }],
		name: "addComposeHash",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

const SAFE_CHAIN_PREFIXES: Record<number, string> = {
	1: "eth",
	8453: "base",
};

function safeQueueUrl(chainId: number, safeAddress: string): string | null {
	const prefix = SAFE_CHAIN_PREFIXES[chainId];
	if (!prefix) return null;
	return `https://app.safe.global/transactions/queue?safe=${prefix}:${safeAddress}`;
}

async function handler(
	input: SafeProposeUpdateInput,
	context: CommandContext,
): Promise<number> {
	try {
		// Dynamic import of Safe SDK — handle CJS/ESM double-default wrapping
		// biome-ignore lint/suspicious/noExplicitAny: dynamic import shape varies by bundler
		let Safe: any;
		// biome-ignore lint/suspicious/noExplicitAny: dynamic import shape varies by bundler
		let ApiKit: any;
		try {
			// biome-ignore lint/suspicious/noExplicitAny: dynamic import shape varies by bundler
			const safeModule: any = await import("@safe-global/protocol-kit");
			// biome-ignore lint/suspicious/noExplicitAny: dynamic import shape varies by bundler
			const apiModule: any = await import("@safe-global/api-kit");
			// Resolve double-default: bundled CJS → m.default.default, ESM → m.default
			Safe = safeModule.default?.init
				? safeModule.default
				: safeModule.default?.default ?? safeModule.default;
			ApiKit = apiModule.default?.prototype?.constructor
				? apiModule.default
				: apiModule.default?.default ?? apiModule.default;
		} catch {
			context.fail(
				"Safe SDK not installed. Run: bun add @safe-global/protocol-kit @safe-global/api-kit",
			);
			return 1;
		}

		// 1. Compute compose hash
		const hashResult = await computeComposeHash(input, context);
		if (!hashResult) return 1;

		// 2. Resolve app contract
		const resolved = await resolveAppContract(hashResult.cvm_id, context);
		if (!resolved) return 1;

		const { chain, chainId, appContractAddress } = resolved;

		// 3. Resolve private key
		const privateKey = resolvePrivateKey(input);

		// 4. Validate chainId is supported by Safe Transaction Service
		if (!SAFE_CHAIN_PREFIXES[chainId]) {
			context.fail(
				`Chain ${chainId} (${chain.name}) is not supported by Safe Transaction Service. Supported: Ethereum (1), Base (8453).`,
			);
			return 1;
		}

		// 5. Validate safe address
		if (!isAddress(input.safeAddress)) {
			context.fail(`Invalid Safe address: ${input.safeAddress}`);
			return 1;
		}
		const safeAddress = input.safeAddress as `0x${string}`;

		// 6. Encode calldata
		const composeHashHex = hashResult.compose_hash.startsWith("0x")
			? hashResult.compose_hash
			: `0x${hashResult.compose_hash}`;
		const calldata = encodeFunctionData({
			abi: addComposeHashAbi,
			functionName: "addComposeHash",
			args: [composeHashHex as `0x${string}`],
		});

		// 7. Derive sender address
		const account = privateKeyToAccount(privateKey);
		const senderAddress = account.address;

		// 8. Init Safe Protocol Kit
		const rpcUrl =
			input.rpcUrl || chain.rpcUrls?.default?.http?.[0];
		if (!rpcUrl) {
			context.fail(
				"No RPC URL available. Use --rpc-url to specify one.",
			);
			return 1;
		}

		const protocolKit = await Safe.init({
			provider: rpcUrl,
			signer: privateKey,
			safeAddress,
		});

		// 9. Create Safe transaction
		const safeTx = await protocolKit.createTransaction({
			transactions: [
				{
					to: appContractAddress,
					data: calldata,
					value: "0",
				},
			],
		});

		// 10. Sign
		const safeTxHash = await protocolKit.getTransactionHash(safeTx);
		const signature = await protocolKit.signHash(safeTxHash);

		// 11. Propose via API Kit
		const safeApiKey = input.safeApiKey || process.env.SAFE_API_KEY;
		const apiKit = new ApiKit({
			chainId: BigInt(chainId),
			...(safeApiKey ? { apiKey: safeApiKey } : {}),
		});

		try {
			await apiKit.proposeTransaction({
				safeAddress,
				safeTransactionData: safeTx.data,
				safeTxHash,
				senderAddress,
				senderSignature: signature.data,
			});
		} catch (proposeError: unknown) {
			const msg = proposeError instanceof Error ? proposeError.message : String(proposeError);
			if (msg.includes("Too Many Requests") || msg.includes("429")) {
				context.fail(
					"Safe Transaction Service rate limit exceeded. Please wait a minute and try again.",
				);
			} else {
				context.fail(`Failed to propose transaction: ${msg}`);
			}
			return 1;
		}

		// 12. Output
		const queueUrl = safeQueueUrl(chainId, safeAddress);

		if (input.json) {
			context.success({
				safeTxHash,
				safeAddress,
				to: appContractAddress,
				composeHash: hashResult.compose_hash,
				appId: hashResult.app_id,
				cvmId: hashResult.cvm_id,
				chainId,
				queueUrl,
			});
			return 0;
		}

		logger.success("Safe transaction proposed successfully!");
		logger.info("");
		logger.info(`Safe Tx Hash: ${safeTxHash}`);
		logger.info(`Safe Address: ${safeAddress}`);
		logger.info(`Target:       ${appContractAddress}`);
		logger.info(`Compose Hash: ${hashResult.compose_hash}`);
		logger.info(`Chain:        ${chain.name} (${chainId})`);
		if (queueUrl) {
			logger.info("");
			logger.info(`View in Safe UI: ${queueUrl}`);
		}
		logger.info("");
		logger.info("Next steps:");
		logger.info(
			"  1. Other signers approve + execute the transaction in the Safe UI",
		);
		logger.info(
			`  2. After execution, run: phala deploy --cvm-id ${hashResult.cvm_id} -c ${input.compose || "docker-compose.yml"} --skip-onchain-tx`,
		);

		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return 1;
	}
}

export const safeProposeUpdateCommand = defineCommand({
	path: ["safe", "propose-update"],
	meta: safeProposeUpdateMeta,
	schema: safeProposeUpdateSchema,
	handler,
});
