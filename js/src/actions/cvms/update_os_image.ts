import { z } from "zod";
import { CvmIdSchema, CvmIdObjectSchema, refineCvmId } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";

/**
 * Update CVM OS image
 *
 * This action initiates an asynchronous OS image update operation.
 * The CVM will be shut down, the OS image updated, and then restarted.
 * This operation may take several minutes to complete.
 *
 * Returns 202 Accepted as the operation runs asynchronously.
 *
 * @example
 * ```typescript
 * import { createClient, updateOsImage } from '@phala/cloud'
 *
 * const client = createClient();
 * await updateOsImage(client, {
 *   id: 'my-cvm-id',
 *   os_image_name: 'prod-0.3.5'
 * });
 * console.log('OS image update initiated');
 * ```
 */

export const UpdateOsImageRequestSchema = refineCvmId(
  CvmIdObjectSchema.extend({
    os_image_name: z.string().min(1, "OS image name is required"),
  }),
);

export type UpdateOsImageRequest = z.infer<typeof UpdateOsImageRequestSchema>;

// PATCH /cvms/{id}/os-image returns 202 Accepted with no body
const { action: updateOsImage, safeAction: safeUpdateOsImage } = defineAction<
  UpdateOsImageRequest,
  z.ZodVoid
>(z.void(), async (client, request) => {
  const parsed = UpdateOsImageRequestSchema.parse(request);
  const { cvmId } = CvmIdSchema.parse(parsed);
  const { os_image_name } = parsed;
  await client.patch(`/cvms/${cvmId}/os-image`, { os_image_name });
  return undefined;
});

export { updateOsImage, safeUpdateOsImage };
