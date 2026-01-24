import { z } from "zod";
import { type Client, type SafeResult } from "../../client";
import { AppRevisionsResponseSchema } from "../../types/app_revision";
import type { AppRevisionsResponse } from "../../types/app_revision";
import type { ApiVersion } from "../../types/client";

export const GetAppRevisionsRequestSchema = z
  .object({
    appId: z.string().min(1),
    page: z.number().int().min(1).optional(),
    page_size: z.number().int().min(1).max(1000).optional(),
  })
  .strict();

export type GetAppRevisionsRequest = z.infer<typeof GetAppRevisionsRequestSchema>;

/**
 * Get a paginated list of revisions for a specific app
 *
 * @param client - The API client
 * @param request - Request parameters
 * @param request.appId - The app ID to get revisions for
 * @param request.page - Page number (1-based)
 * @param request.page_size - Number of items per page (max 1000)
 * @returns Paginated list of app revisions
 *
 * @example
 * ```typescript
 * // Get first page of revisions
 * const revisions = await getAppRevisions(client, { appId: "my-app-id" })
 *
 * // Get with pagination
 * const revisions = await getAppRevisions(client, { appId: "my-app-id", page: 2, page_size: 50 })
 * ```
 */
export async function getAppRevisions<V extends ApiVersion>(
  client: Client<V>,
  request: GetAppRevisionsRequest,
): Promise<AppRevisionsResponse> {
  const { appId, ...params } = GetAppRevisionsRequestSchema.parse(request);
  const response = await client.get(`/apps/${appId}/revisions`, { params });
  return AppRevisionsResponseSchema.parse(response);
}

/**
 * Safe version of getAppRevisions that returns a SafeResult instead of throwing
 */
export async function safeGetAppRevisions<V extends ApiVersion>(
  client: Client<V>,
  request: GetAppRevisionsRequest,
): Promise<SafeResult<AppRevisionsResponse>> {
  try {
    const data = await getAppRevisions(client, request);
    return { success: true, data };
  } catch (error) {
    if (error && typeof error === "object" && ("status" in error || "issues" in error)) {
      return { success: false, error } as SafeResult<AppRevisionsResponse>;
    }
    return {
      success: false,
      error: {
        name: "Error",
        message: error instanceof Error ? error.message : String(error),
      },
    } as SafeResult<AppRevisionsResponse>;
  }
}
