import { z } from "zod";
import {
  type Chain,
  type Address,
  type Hash,
  type Hex,
  type TransactionReceipt,
  type PublicClient,
  type WalletClient,
  createPublicClient,
  createWalletClient,
  http,
  parseEventLogs,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  type NetworkClients,
  validateNetworkPrerequisites,
  type TransactionTracker,
  createTransactionTracker,
  type RetryOptions,
  executeTransactionWithRetry,
  type TransactionOptions,
} from "../../utils";
import { dstackAppAbi } from "./abi/dstack_app";

const TransferOwnershipRequestSchema = z
  .object({
    chain: z.unknown().optional(),
    rpcUrl: z.string().optional(),
    appAddress: z.string(),
    newOwner: z.string(),
    privateKey: z.string().optional(),
    walletClient: z.unknown().optional(),
    publicClient: z.unknown().optional(),
    skipPrerequisiteChecks: z.boolean().optional().default(false),
    minBalance: z.string().optional(),
    timeout: z.number().optional().default(120000),
    retryOptions: z.unknown().optional(),
    signal: z.unknown().optional(),
    onTransactionStateChange: z.function().optional(),
    onTransactionSubmitted: z.function().optional(),
    onTransactionConfirmed: z.function().optional(),
  })
  .passthrough()
  .refine(
    (data) => {
      const hasPrivateKey = !!data.privateKey;
      const hasWalletClient = !!data.walletClient;
      return hasPrivateKey !== hasWalletClient;
    },
    {
      message: "Either 'privateKey' or 'walletClient' must be provided, but not both",
      path: ["privateKey", "walletClient"],
    },
  )
  .refine(
    (data) => {
      const hasPublicClient = !!data.publicClient;
      const hasWalletClient = !!data.walletClient;
      const hasChain = !!data.chain;
      if (hasPublicClient && hasWalletClient) return true;
      return hasChain;
    },
    {
      message: "Chain is required when publicClient or walletClient is not provided",
      path: ["chain"],
    },
  );

export type TransferOwnershipRequest = {
  chain?: Chain;
  rpcUrl?: string;
  appAddress: Address;
  newOwner: Address;
  privateKey?: Hex;
  walletClient?: WalletClient;
  publicClient?: PublicClient;
  skipPrerequisiteChecks?: boolean;
  minBalance?: string;
  timeout?: number;
  retryOptions?: RetryOptions;
  signal?: AbortSignal;
  onTransactionStateChange?: (state: TransactionTracker["status"]) => void;
  onTransactionSubmitted?: (hash: Hash) => void;
  onTransactionConfirmed?: (receipt: TransactionReceipt) => void;
};

export const TransferOwnershipSchema = z
  .object({
    previousOwner: z.string(),
    newOwner: z.string(),
    transactionHash: z.string(),
    blockNumber: z.bigint().optional(),
    gasUsed: z.bigint().optional(),
  })
  .passthrough();

export type TransferOwnership = z.infer<typeof TransferOwnershipSchema>;

export type TransferOwnershipParameters<T = undefined> = T extends z.ZodTypeAny
  ? { schema: T }
  : T extends false
    ? { schema: false }
    : { schema?: z.ZodTypeAny | false };

export type TransferOwnershipReturnType<T = undefined> = T extends z.ZodTypeAny
  ? z.infer<T>
  : T extends false
    ? unknown
    : TransferOwnership;

function parseTransferOwnershipResult(
  receipt: TransactionReceipt,
  appAddress: Address,
  expectedNewOwner: Address,
): TransferOwnership {
  try {
    const logs = parseEventLogs({
      abi: dstackAppAbi,
      eventName: "OwnershipTransferred",
      logs: receipt.logs,
      strict: false,
    });

    if (logs.length > 0) {
      const event = logs[0];
      return {
        previousOwner: (event?.args as { previousOwner?: string })?.previousOwner ?? "",
        newOwner: (event?.args as { newOwner?: string })?.newOwner ?? expectedNewOwner,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      };
    }

    return {
      previousOwner: "",
      newOwner: expectedNewOwner,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };
  } catch {
    return {
      previousOwner: "",
      newOwner: expectedNewOwner,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };
  }
}

export async function transferOwnership<T extends z.ZodTypeAny | false | undefined = undefined>(
  request: TransferOwnershipRequest,
  parameters?: TransferOwnershipParameters<T>,
): Promise<TransferOwnershipReturnType<T>> {
  const validatedRequest = TransferOwnershipRequestSchema.parse(request);

  const {
    chain,
    rpcUrl,
    appAddress: rawAppAddress,
    newOwner: rawNewOwner,
    privateKey,
    walletClient: providedWalletClient,
    publicClient: providedPublicClient,
    timeout = 120000,
    retryOptions,
    signal,
    onTransactionStateChange,
    onTransactionSubmitted,
    onTransactionConfirmed,
    skipPrerequisiteChecks = false,
    minBalance,
  } = validatedRequest;

  const appAddress = (
    rawAppAddress.startsWith("0x") ? rawAppAddress : `0x${rawAppAddress}`
  ) as Address;
  const newOwner = (rawNewOwner.startsWith("0x") ? rawNewOwner : `0x${rawNewOwner}`) as Address;

  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let address: Address;
  let chainId: number;

  if (privateKey) {
    const account = privateKeyToAccount(privateKey as Hex);

    if (providedPublicClient) {
      publicClient = providedPublicClient as PublicClient;
    } else {
      if (!chain) throw new Error("Chain required when creating publicClient");
      publicClient = createPublicClient({ chain: chain as Chain, transport: http(rpcUrl) });
    }

    if (!chain) throw new Error("Chain required when creating walletClient");
    walletClient = createWalletClient({
      account,
      chain: chain as Chain,
      transport: http(rpcUrl),
    });

    address = account.address;
    chainId = (chain as Chain).id;
  } else if (providedWalletClient) {
    walletClient = providedWalletClient as WalletClient;

    if (providedPublicClient) {
      publicClient = providedPublicClient as PublicClient;
    } else {
      if (!chain) throw new Error("Chain required when creating publicClient");
      publicClient = createPublicClient({ chain: chain as Chain, transport: http(rpcUrl) });
    }

    if (!walletClient.account?.address) {
      throw new Error("WalletClient must have an account with address");
    }
    address = walletClient.account.address;
    chainId = chain ? (chain as Chain).id : await walletClient.getChainId();
  } else {
    throw new Error("Either privateKey or walletClient must be provided");
  }

  const networkClients: NetworkClients = {
    publicClient,
    walletClient,
    address,
    chainId,
  };

  const transactionTracker = createTransactionTracker();

  if (onTransactionStateChange && typeof onTransactionStateChange === "function") {
    const pollStatus = (): void => {
      onTransactionStateChange(transactionTracker.status);
      if (!transactionTracker.isComplete) {
        setTimeout(pollStatus, 100);
      }
    };
    setTimeout(pollStatus, 10);
  }

  if (!skipPrerequisiteChecks) {
    const requirements = {
      targetChainId: chainId,
      minBalance: minBalance ? parseEther(minBalance) : parseEther("0.001"),
    };

    const validation = await validateNetworkPrerequisites(networkClients, requirements);

    if (!validation.networkValid) {
      throw new Error(
        `Network mismatch: Expected chain ${requirements.targetChainId}, but wallet is on chain ${validation.details.currentChainId}`,
      );
    }

    if (!validation.balanceValid) {
      const requiredEth = Number(requirements.minBalance) / 1e18;
      const currentEth = Number(validation.details.balance) / 1e18;
      throw new Error(
        `Insufficient balance: Required ${requiredEth} ETH, but account has ${currentEth.toFixed(6)} ETH`,
      );
    }
  }

  const transferOwnershipOperation = async (clients: NetworkClients): Promise<Hash> => {
    const hash = await clients.walletClient.writeContract({
      address: appAddress,
      abi: dstackAppAbi,
      functionName: "transferOwnership",
      args: [newOwner],
      account: clients.walletClient.account || clients.address,
      chain: (chain as Chain) || null,
    });

    return hash;
  };

  const transactionResult = retryOptions
    ? await executeTransactionWithRetry(
        transferOwnershipOperation,
        networkClients,
        [],
        {
          timeout: timeout as number,
          confirmations: 1,
          onSubmitted: onTransactionSubmitted,
          onConfirmed: onTransactionConfirmed,
          signal: signal,
        } as TransactionOptions & { signal?: AbortSignal },
        retryOptions,
      )
    : await transactionTracker.execute(transferOwnershipOperation, networkClients, [], {
        timeout: timeout as number,
        confirmations: 1,
        onSubmitted: onTransactionSubmitted,
        onConfirmed: onTransactionConfirmed,
        signal: signal,
      } as TransactionOptions & { signal?: AbortSignal });

  const result = parseTransferOwnershipResult(transactionResult.receipt, appAddress, newOwner);

  if (parameters?.schema === false) {
    return result as TransferOwnershipReturnType<T>;
  }

  const schema = (parameters?.schema || TransferOwnershipSchema) as z.ZodTypeAny;
  return schema.parse(result) as TransferOwnershipReturnType<T>;
}

export type SafeTransferOwnershipResult<T = undefined> =
  | {
      success: true;
      data: TransferOwnershipReturnType<T>;
    }
  | {
      success: false;
      error: { isRequestError: true; message: string; status: number; detail: string };
    };

export async function safeTransferOwnership<T extends z.ZodTypeAny | false | undefined = undefined>(
  request: TransferOwnershipRequest,
  parameters?: TransferOwnershipParameters<T>,
): Promise<SafeTransferOwnershipResult<T>> {
  try {
    const result = await transferOwnership(request, parameters);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown blockchain error";
    return {
      success: false,
      error: {
        isRequestError: true,
        message: errorMessage,
        status: 500,
        detail: errorMessage,
      },
    };
  }
}
