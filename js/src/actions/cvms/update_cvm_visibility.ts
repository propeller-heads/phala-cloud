import { z } from "zod";
import { CvmIdSchema, CvmIdObjectSchema, refineCvmId } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";
import { CvmLegacyDetailSchema } from "../../types/cvm_info";

/**
 * Update CVM visibility settings
 *
 * This action updates whether system info and logs are publicly accessible.
 *
 * @example
 * ```typescript
 * import { createClient, updateCvmVisibility } from '@phala/cloud'
 *
 * const client = createClient();
 * const result = await updateCvmVisibility(client, {
 *   id: 'my-cvm-id',
 *   public_sysinfo: true,
 *   public_logs: false
 * });
 * console.log(result.public_sysinfo, result.public_logs);
 * ```
 */

export const UpdateCvmVisibilityRequestSchema = refineCvmId(
  CvmIdObjectSchema.extend({
    public_sysinfo: z.boolean(),
    public_logs: z.boolean(),
  }),
);

export type UpdateCvmVisibilityRequest = z.infer<typeof UpdateCvmVisibilityRequestSchema>;

const { action: updateCvmVisibility, safeAction: safeUpdateCvmVisibility } = defineAction<
  UpdateCvmVisibilityRequest,
  typeof CvmLegacyDetailSchema
>(CvmLegacyDetailSchema, async (client, request) => {
  const parsed = UpdateCvmVisibilityRequestSchema.parse(request);
  const { cvmId } = CvmIdSchema.parse(parsed);
  const { public_sysinfo, public_logs } = parsed;
  return await client.patch(`/cvms/${cvmId}/visibility`, {
    body: { public_sysinfo, public_logs },
  });
});

export { updateCvmVisibility, safeUpdateCvmVisibility };
