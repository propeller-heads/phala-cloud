import { z } from "zod";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";

/**
 * Delete a CVM (Confidential Virtual Machine)
 *
 * This action permanently deletes a CVM instance and all its data.
 * This operation cannot be undone.
 *
 * @example
 * ```typescript
 * import { createClient, deleteCvm } from '@phala/cloud'
 *
 * const client = createClient();
 * await deleteCvm(client, { id: 'my-cvm-id' });
 * console.log('CVM deleted');
 * ```
 *
 * ## Safe Version
 *
 * Use `safeDeleteCvm` for error handling without exceptions:
 *
 * ```typescript
 * const result = await safeDeleteCvm(client, { id: 'my-cvm-id' });
 * if (result.success) {
 *   console.log('CVM successfully deleted');
 * } else {
 *   console.error('Failed to delete CVM:', result.error.message);
 * }
 * ```
 */

export const DeleteCvmRequestSchema = CvmIdSchema;

export type DeleteCvmRequest = CvmIdInput;

// DELETE returns 204 No Content, so we use z.void()
const { action: deleteCvm, safeAction: safeDeleteCvm } = defineAction<DeleteCvmRequest, z.ZodVoid>(
  z.void(),
  async (client, request) => {
    const { cvmId } = DeleteCvmRequestSchema.parse(request);
    await client.delete(`/cvms/${cvmId}`);
    return undefined;
  },
);

export { deleteCvm, safeDeleteCvm };
