import { z } from "zod";
import { type Client } from "../../client";
import { CvmLegacyDetailSchema } from "../../types/cvm_info";
import { type KmsInfo } from "../../types/kms_info";
import { defineAction } from "../../utils/define-action";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";

export { CvmLegacyDetailSchema };

export type GetCvmInfoResponse = z.infer<typeof CvmLegacyDetailSchema> & { kms_info: KmsInfo };

export const GetCvmInfoRequestSchema = CvmIdSchema;

export type GetCvmInfoRequest = CvmIdInput;

/**
 * Get information about a specific CVM
 *
 * @param client - The API client
 * @param request - Request parameters
 * @param request.cvmId - ID of the CVM to get information for
 * @param parameters - Optional behavior parameters
 * @returns CVM information
 *
 * @example
 * ```typescript
 * const info = await getCvmInfo(client, { cvmId: "cvm-123" })
 * ```
 */
const { action: getCvmInfo, safeAction: safeGetCvmInfo } = defineAction<
  GetCvmInfoRequest,
  typeof CvmLegacyDetailSchema,
  GetCvmInfoResponse
>(CvmLegacyDetailSchema, async (client, request) => {
  const { cvmId } = GetCvmInfoRequestSchema.parse(request);
  return await client.get(`/cvms/${cvmId}`);
});

export { getCvmInfo, safeGetCvmInfo };
