import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";
import { VMSchema } from "../../types/cvm_info";

/**
 * Force stop a CVM (Confidential Virtual Machine)
 *
 * This action forcefully stops a running CVM instance immediately,
 * similar to pulling the power plug. Use shutdown for graceful stops.
 *
 * @example
 * ```typescript
 * import { createClient, stopCvm } from '@phala/cloud'
 *
 * const client = createClient();
 * const result = await stopCvm(client, { id: 'my-cvm-id' });
 * console.log(result.status); // "stopped"
 * ```
 *
 * ## Safe Version
 *
 * Use `safeStopCvm` for error handling without exceptions:
 *
 * ```typescript
 * const result = await safeStopCvm(client, { id: 'my-cvm-id' });
 * if (result.success) {
 *   console.log('CVM stopped:', result.data.status);
 * } else {
 *   console.error('Failed to stop CVM:', result.error.message);
 * }
 * ```
 */

export const StopCvmRequestSchema = CvmIdSchema;

export type StopCvmRequest = CvmIdInput;

const { action: stopCvm, safeAction: safeStopCvm } = defineAction<StopCvmRequest, typeof VMSchema>(
  VMSchema,
  async (client, request) => {
    const { cvmId } = StopCvmRequestSchema.parse(request);
    return await client.post(`/cvms/${cvmId}/stop`);
  },
);

export { stopCvm, safeStopCvm };
