import { z } from "zod";
import { type Chain, type Address, type PublicClient, createPublicClient, http } from "viem";
import { asHex } from "../../utils";
import { dstackAppAbi } from "./abi/dstack_app";

/**
 * Query the on-chain device allowlist for a DstackApp contract.
 *
 * Checks a list of candidate device IDs against the contract's
 * `allowedDeviceIds` mapping and returns the ones that are allowed.
 *
 * @group Actions
 * @since 0.6.0
 *
 * ## Usage
 *
 * ```typescript
 * import { getAllowedDevices } from '@phala/cloud'
 * import { base } from 'viem/chains'
 *
 * const result = await getAllowedDevices({
 *   chain: base,
 *   appAddress: "0x1234...abcd",
 *   deviceIds: ["0xaa...", "0xbb..."],
 * })
 * console.log(result.devices)       // ["0xaa..."]
 * console.log(result.allowAnyDevice) // false
 * ```
 */

// ── Request ────────────────────────────────────────────────────────

export type GetAllowedDevicesRequest = {
  chain?: Chain;
  rpcUrl?: string;
  appAddress: Address;
  /** Candidate device IDs to check against the on-chain allowlist. */
  deviceIds: string[];
  publicClient?: PublicClient;
};

// ── Response ───────────────────────────────────────────────────────

export const GetAllowedDevicesSchema = z.object({
  appAddress: z.string(),
  allowAnyDevice: z.boolean(),
  devices: z.array(z.string()),
});

export type GetAllowedDevices = z.infer<typeof GetAllowedDevicesSchema>;

// ── Implementation ─────────────────────────────────────────────────

export async function getAllowedDevices(
  request: GetAllowedDevicesRequest,
): Promise<GetAllowedDevices> {
  const { chain, rpcUrl, appAddress, deviceIds, publicClient: providedPublicClient } = request;

  const contractAddress = (appAddress.startsWith("0x") ? appAddress : `0x${appAddress}`) as Address;

  const publicClient: PublicClient = providedPublicClient
    ? providedPublicClient
    : (() => {
        if (!chain) throw new Error("Chain is required when publicClient is not provided");
        return createPublicClient({ chain, transport: http(rpcUrl) });
      })();

  // Read allowAnyDevice flag
  const allowAnyDevice = (await publicClient.readContract({
    address: contractAddress,
    abi: dstackAppAbi,
    functionName: "allowAnyDevice",
  })) as boolean;

  // If allowAnyDevice is true, all candidate devices are allowed
  if (allowAnyDevice) {
    return {
      appAddress: contractAddress,
      allowAnyDevice: true,
      devices: deviceIds.map((id) => asHex(id)),
    };
  }

  // Check each candidate device against the on-chain allowlist
  const results = await Promise.all(
    deviceIds.map(async (deviceId) => {
      const hex = asHex(deviceId);
      const allowed = (await publicClient.readContract({
        address: contractAddress,
        abi: dstackAppAbi,
        functionName: "allowedDeviceIds",
        args: [hex],
      })) as boolean;
      return { deviceId: hex, allowed };
    }),
  );

  const devices = results.filter((r) => r.allowed).map((r) => r.deviceId);

  return {
    appAddress: contractAddress,
    allowAnyDevice: false,
    devices,
  };
}

// ── Safe variant ───────────────────────────────────────────────────

export type SafeGetAllowedDevicesResult =
  | { success: true; data: GetAllowedDevices }
  | {
      success: false;
      error: { isRequestError: true; message: string; status: number; detail: string };
    };

export async function safeGetAllowedDevices(
  request: GetAllowedDevicesRequest,
): Promise<SafeGetAllowedDevicesResult> {
  try {
    const result = await getAllowedDevices(request);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown blockchain error";
    return {
      success: false,
      error: { isRequestError: true, message: errorMessage, status: 500, detail: errorMessage },
    };
  }
}
