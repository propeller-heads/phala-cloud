import { z } from "zod";
import { type Client, type SafeResult } from "../../client";
import type { ApiVersion } from "../../types/client";
import { CvmInfoV20251028Schema } from "../../types/cvm_info_v20251028";
import type { CvmInfoV20251028 } from "../../types/cvm_info_v20251028";
import { CvmInfoV20260121Schema } from "../../types/cvm_info_v20260121";
import type { CvmInfoV20260121 } from "../../types/cvm_info_v20260121";
import type { GetAppCvmsResponseForVersion } from "../../types/version-mappings";

export const GetAppCvmsRequestSchema = z
  .object({
    appId: z.string().min(1),
  })
  .strict();

export type GetAppCvmsRequest = z.infer<typeof GetAppCvmsRequestSchema>;

export type GetAppCvmsResponse = CvmInfoV20251028[] | CvmInfoV20260121[];

function getSchemaForVersion(version: ApiVersion) {
  return version === "2025-10-28"
    ? z.array(CvmInfoV20251028Schema)
    : z.array(CvmInfoV20260121Schema);
}

/**
 * Get a list of CVMs for a specific app
 *
 * @param client - The API client
 * @param request - Request parameters
 * @param request.appId - The app ID to get CVMs for
 * @returns List of CVMs with type based on client API version
 *
 * @example
 * ```typescript
 * const cvms = await getAppCvms(client, { appId: "my-app-id" })
 * ```
 */
export function getAppCvms<V extends ApiVersion>(
  client: Client<V>,
  request: GetAppCvmsRequest,
): Promise<GetAppCvmsResponseForVersion<V>>;
export async function getAppCvms<V extends ApiVersion>(
  client: Client<V>,
  request: GetAppCvmsRequest,
): Promise<GetAppCvmsResponseForVersion<V>> {
  const { appId } = GetAppCvmsRequestSchema.parse(request);
  const response = await client.get(`/apps/${appId}/cvms`);
  const schema = getSchemaForVersion(client.config.version);
  return schema.parse(response) as GetAppCvmsResponseForVersion<V>;
}

/**
 * Safe version of getAppCvms that returns a SafeResult instead of throwing
 */
export function safeGetAppCvms<V extends ApiVersion>(
  client: Client<V>,
  request: GetAppCvmsRequest,
): Promise<SafeResult<GetAppCvmsResponseForVersion<V>>>;
export async function safeGetAppCvms<V extends ApiVersion>(
  client: Client<V>,
  request: GetAppCvmsRequest,
): Promise<SafeResult<GetAppCvmsResponseForVersion<V>>> {
  try {
    const data = await getAppCvms(client, request);
    return { success: true, data };
  } catch (error) {
    if (error && typeof error === "object" && ("status" in error || "issues" in error)) {
      return { success: false, error } as SafeResult<GetAppCvmsResponseForVersion<V>>;
    }
    return {
      success: false,
      error: {
        name: "Error",
        message: error instanceof Error ? error.message : String(error),
      },
    } as SafeResult<GetAppCvmsResponseForVersion<V>>;
  }
}
