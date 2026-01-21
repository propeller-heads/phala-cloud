import { z } from "zod";
import { type Client, type SafeResult } from "../../client";
import { AppRevisionDetailResponseSchema } from "../../types/app_revision";
import type { AppRevisionDetailResponse } from "../../types/app_revision";
import type { ApiVersion } from "../../types/client";

export const GetAppRevisionDetailRequestSchema = z
  .object({
    appId: z.string().min(1),
    composeHash: z.string().min(1),
    rawComposeFile: z.boolean().optional(),
  })
  .strict();

export type GetAppRevisionDetailRequest = z.infer<typeof GetAppRevisionDetailRequestSchema>;

/**
 * Get detailed information about a specific app revision
 *
 * @param client - The API client
 * @param request - Request parameters
 * @param request.appId - The app ID
 * @param request.composeHash - The compose hash of the revision
 * @param request.rawComposeFile - If true, returns compose_file as raw string instead of parsed object
 * @returns Detailed revision information including compose file and encrypted env
 *
 * @example
 * ```typescript
 * const detail = await getAppRevisionDetail(client, {
 *   appId: "my-app-id",
 *   composeHash: "abc123"
 * })
 *
 * // Get with raw compose file
 * const detail = await getAppRevisionDetail(client, {
 *   appId: "my-app-id",
 *   composeHash: "abc123",
 *   rawComposeFile: true
 * })
 * ```
 */
export async function getAppRevisionDetail<V extends ApiVersion>(
  client: Client<V>,
  request: GetAppRevisionDetailRequest,
): Promise<AppRevisionDetailResponse> {
  const { appId, composeHash, rawComposeFile } = GetAppRevisionDetailRequestSchema.parse(request);
  const params = rawComposeFile !== undefined ? { raw_compose_file: rawComposeFile } : undefined;
  const response = await client.get(`/apps/${appId}/revisions/${composeHash}`, { params });
  return AppRevisionDetailResponseSchema.parse(response);
}

/**
 * Safe version of getAppRevisionDetail that returns a SafeResult instead of throwing
 */
export async function safeGetAppRevisionDetail<V extends ApiVersion>(
  client: Client<V>,
  request: GetAppRevisionDetailRequest,
): Promise<SafeResult<AppRevisionDetailResponse>> {
  try {
    const data = await getAppRevisionDetail(client, request);
    return { success: true, data };
  } catch (error) {
    if (error && typeof error === "object" && ("status" in error || "issues" in error)) {
      return { success: false, error } as SafeResult<AppRevisionDetailResponse>;
    }
    return {
      success: false,
      error: {
        name: "Error",
        message: error instanceof Error ? error.message : String(error),
      },
    } as SafeResult<AppRevisionDetailResponse>;
  }
}
