import { z } from "zod";
import { type Client, type SafeResult } from "../../client";
import type { ApiVersion } from "../../types/client";

export const AppFilterOptionsSchema = z.object({
  statuses: z.array(z.string()),
  image_versions: z.array(z.string()),
  instance_types: z.array(z.string()),
  kms_slugs: z.array(z.string()),
  kms_types: z.array(z.string()),
  regions: z.array(z.string()),
  nodes: z.array(z.string()),
});
export type AppFilterOptions = z.infer<typeof AppFilterOptionsSchema>;

/**
 * Get available filter options for apps
 *
 * Returns distinct values for each filterable field based on the current workspace's apps.
 *
 * @param client - The API client
 * @returns Available filter option values
 */
export function getAppFilterOptions<V extends ApiVersion>(
  client: Client<V>,
): Promise<AppFilterOptions>;
export async function getAppFilterOptions<V extends ApiVersion>(
  client: Client<V>,
): Promise<AppFilterOptions> {
  const response = await client.get("/apps/filter-options");
  return AppFilterOptionsSchema.parse(response);
}

/**
 * Safe version of getAppFilterOptions that returns a SafeResult instead of throwing
 */
export function safeGetAppFilterOptions<V extends ApiVersion>(
  client: Client<V>,
): Promise<SafeResult<AppFilterOptions>>;
export async function safeGetAppFilterOptions<V extends ApiVersion>(
  client: Client<V>,
): Promise<SafeResult<AppFilterOptions>> {
  try {
    const data = await getAppFilterOptions(client);
    return { success: true, data };
  } catch (error) {
    if (error && typeof error === "object" && ("status" in error || "issues" in error)) {
      return { success: false, error } as SafeResult<AppFilterOptions>;
    }
    return {
      success: false,
      error: {
        name: "Error",
        message: error instanceof Error ? error.message : String(error),
      },
    } as SafeResult<AppFilterOptions>;
  }
}
