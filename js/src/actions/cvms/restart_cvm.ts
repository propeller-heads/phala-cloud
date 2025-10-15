import { z } from "zod";
import { CvmIdSchema, CvmIdObjectSchema, refineCvmId } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";
import { VMSchema } from "../../types/cvm_info";

/**
 * Restart a CVM (Confidential Virtual Machine)
 *
 * This action performs a graceful restart of a running CVM instance,
 * shutting down cleanly and then starting it again.
 *
 * @example
 * ```typescript
 * import { createClient, restartCvm } from '@phala/cloud'
 *
 * const client = createClient();
 * const result = await restartCvm(client, { id: 'my-cvm-id' });
 * console.log(result.status); // "restarting"
 *
 * // Force restart (may skip graceful shutdown)
 * const forceResult = await restartCvm(client, { id: 'my-cvm-id', force: true });
 * ```
 *
 * ## Safe Version
 *
 * Use `safeRestartCvm` for error handling without exceptions:
 *
 * ```typescript
 * const result = await safeRestartCvm(client, { id: 'my-cvm-id' });
 * if (result.success) {
 *   console.log('CVM restarting:', result.data.status);
 * } else {
 *   console.error('Failed to restart CVM:', result.error.message);
 * }
 * ```
 */

export const RestartCvmRequestSchema = refineCvmId(
  CvmIdObjectSchema.extend({
    force: z.boolean().optional(),
  }),
);

export type RestartCvmRequest = z.infer<typeof RestartCvmRequestSchema>;

const { action: restartCvm, safeAction: safeRestartCvm } = defineAction<
  RestartCvmRequest,
  typeof VMSchema
>(VMSchema, async (client, request) => {
  const parsed = RestartCvmRequestSchema.parse(request);
  const { cvmId } = CvmIdSchema.parse(parsed);
  const { force = false } = parsed;
  return await client.post(`/cvms/${cvmId}/restart`, { body: { force } });
});

export { restartCvm, safeRestartCvm };
