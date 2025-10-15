import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";
import { VMSchema } from "../../types/cvm_info";

/**
 * Shutdown a CVM (Confidential Virtual Machine) gracefully
 *
 * This action performs a graceful shutdown of a running CVM instance,
 * allowing the guest OS to shut down cleanly.
 *
 * @example
 * ```typescript
 * import { createClient, shutdownCvm } from '@phala/cloud'
 *
 * const client = createClient();
 * console.log(result.status); // "shutting_down"
 * ```
 *
 * ## Safe Version
 *
 * Use `safeShutdownCvm` for error handling without exceptions:
 *
 * ```typescript
 * if (result.success) {
 *   console.log('CVM shutting down:', result.data.status);
 * } else {
 *   console.error('Failed to shutdown CVM:', result.error.message);
 * }
 * ```
 */

export const ShutdownCvmRequestSchema = CvmIdSchema;

export type ShutdownCvmRequest = CvmIdInput;

const { action: shutdownCvm, safeAction: safeShutdownCvm } = defineAction<
  ShutdownCvmRequest,
  typeof VMSchema
>(VMSchema, async (client, request) => {
  const { cvmId } = ShutdownCvmRequestSchema.parse(request);
  return await client.post(`/cvms/${cvmId}/shutdown`);
});

export { shutdownCvm, safeShutdownCvm };
