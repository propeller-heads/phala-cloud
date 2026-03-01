import { z } from "zod";
import { defineAction } from "../../utils/define-action";
import { InstanceIdRefreshResultSchema } from "./refresh_cvm_instance_id";

export const RefreshCvmInstanceIdsRequestSchema = z
  .object({
    cvm_ids: z.array(z.string()).optional(),
    running_only: z.boolean().optional(),
    missing_only: z.boolean().optional(),
    overwrite: z.boolean().optional(),
    limit: z.number().int().min(1).max(500).optional(),
    dry_run: z.boolean().optional(),
  })
  .strict();

export type RefreshCvmInstanceIdsRequest = z.infer<typeof RefreshCvmInstanceIdsRequestSchema>;

export const RefreshCvmInstanceIdsResponseSchema = z.object({
  total: z.number().int(),
  scanned: z.number().int(),
  updated: z.number().int(),
  unchanged: z.number().int(),
  skipped: z.number().int(),
  conflicts: z.number().int(),
  errors: z.number().int(),
  items: z.array(InstanceIdRefreshResultSchema),
});

export type RefreshCvmInstanceIdsResponse = z.infer<typeof RefreshCvmInstanceIdsResponseSchema>;

const { action: refreshCvmInstanceIds, safeAction: safeRefreshCvmInstanceIds } = defineAction<
  RefreshCvmInstanceIdsRequest,
  typeof RefreshCvmInstanceIdsResponseSchema
>(RefreshCvmInstanceIdsResponseSchema, async (client, request) => {
  const parsed = RefreshCvmInstanceIdsRequestSchema.parse(request);
  return await client.patch("/cvms/instance-ids", parsed);
});

export { refreshCvmInstanceIds, safeRefreshCvmInstanceIds };
