import { defineAction } from "../../utils/define-action";
import { VMSchema } from "../../types/cvm_info";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";

/**
 * Start a CVM (Confidential Virtual Machine)
 *
 * This action starts a stopped or shutdown CVM instance.
 *
 * @example
 * ```typescript
 * import { createClient, startCvm } from '@phala/cloud'
 *
 * const client = createClient();
 * const result = await startCvm(client, { id: 'my-cvm-id' });
 * console.log(result.status); // "starting"
 * ```
 *
 * ## Safe Version
 *
 * Use `safeStartCvm` for error handling without exceptions:
 *
 * ```typescript
 * const result = await safeStartCvm(client, { id: 'my-cvm-id' });
 * if (result.success) {
 *   console.log('CVM started:', result.data.status);
 * } else {
 *   console.error('Failed to start CVM:', result.error.message);
 * }
 * ```
 */

export const StartCvmRequestSchema = CvmIdSchema;

export type StartCvmRequest = CvmIdInput;

const { action: startCvm, safeAction: safeStartCvm } = defineAction<
  StartCvmRequest,
  typeof VMSchema
>(VMSchema, async (client, request) => {
  const { cvmId } = StartCvmRequestSchema.parse(request);
  return await client.post(`/cvms/${cvmId}/start`);
});

export { startCvm, safeStartCvm };
