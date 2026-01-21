import { createClient, type Client } from "@phala/cloud";
import { getApiKey } from "@/src/utils/credentials";

// Use legacy API version until CLI types are updated for the new format
const API_VERSION = "2025-10-28" as const;

/**
 * Get a configured API client with automatic API key resolution
 * @returns Promise resolving to configured Client instance
 */
export async function getClient(): Promise<Client<typeof API_VERSION>> {
	const apiKey = getApiKey();
	return createClient({ apiKey, version: API_VERSION });
}

/**
 * Get a configured API client with custom API key
 * @param apiKey - Custom API key to use
 * @returns Promise resolving to configured Client instance
 */
export async function getClientWithKey(
	apiKey: string,
): Promise<Client<typeof API_VERSION>> {
	return createClient({ apiKey, version: API_VERSION });
}
