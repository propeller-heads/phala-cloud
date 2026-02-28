import { z } from "zod";
import { CvmIdSchema, CvmIdObjectSchema, refineCvmId } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";
import { VMSchema } from "../../types/cvm_info";

/**
 * Replicate (scale up) a CVM by creating a new replica
 *
 * This action creates a new CVM instance with the same configuration
 * as the source CVM, effectively scaling up the application.
 *
 * @example
 * ```typescript
 * import { createClient, replicateCvm } from '@phala/cloud'
 *
 * const client = createClient();
 * const replica = await replicateCvm(client, { id: 'my-cvm-id' });
 * console.log(replica.vm_uuid); // new replica UUID
 *
 * // Replicate to a specific node
 * const replica2 = await replicateCvm(client, { id: 'my-cvm-id', node_id: 42 });
 * ```
 *
 * ## Safe Version
 *
 * Use `safeReplicateCvm` for error handling without exceptions:
 *
 * ```typescript
 * const result = await safeReplicateCvm(client, { id: 'my-cvm-id' });
 * if (result.success) {
 *   console.log('Replica created:', result.data.vm_uuid);
 * } else {
 *   console.error('Failed to replicate CVM:', result.error.message);
 * }
 * ```
 */

export const ReplicateCvmRequestSchema = refineCvmId(
  CvmIdObjectSchema.extend({
    node_id: z.number().optional(),
  }),
);

export type ReplicateCvmRequest = z.infer<typeof ReplicateCvmRequestSchema>;

const { action: replicateCvm, safeAction: safeReplicateCvm } = defineAction<
  ReplicateCvmRequest,
  typeof VMSchema
>(VMSchema, async (client, request) => {
  const parsed = ReplicateCvmRequestSchema.parse(request);
  const { cvmId } = CvmIdSchema.parse(parsed);
  const { node_id } = parsed;
  return await client.post(`/cvms/${cvmId}/replicas`, { node_id });
});

export { replicateCvm, safeReplicateCvm };
