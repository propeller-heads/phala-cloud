import { z } from "zod";
import { type Client } from "../../client";
import { defineAction } from "../../utils/define-action";

/**
 * Get workspace resource quotas
 *
 * Returns tier-based quota limits and current usage for the workspace.
 * Values of -1 indicate unlimited resources (e.g., enterprise tier).
 *
 * @example
 * ```typescript
 * import { createClient, getWorkspaceQuotas } from '@phala/cloud'
 *
 * const client = createClient({ apiKey: 'your-api-key' })
 * const quotas = await getWorkspaceQuotas(client, { teamSlug: 'team-slug' })
 * // Output: {
 * //   team_slug: 'team-slug',
 * //   tier: 'free',
 * //   quotas: { vm_slots: { limit: 10, remaining: 5 }, ... },
 * //   reserved_nodes: { limit: 1, remaining: 0 },
 * //   reserved_gpu: { gpus: { limit: 0, remaining: 0 }, in_use: 0, misconfigured: 0 },
 * //   as_of: '2026-01-31T12:00:00Z'
 * // }
 * ```
 *
 * ## Returns
 *
 * `GetWorkspaceQuotas | unknown`
 *
 * Workspace quota information. Return type depends on schema parameter.
 *
 * ## Parameters
 *
 * ### request (required)
 * - **Type:** `GetWorkspaceQuotasRequest`
 *
 * Request parameters with workspace identifier.
 *
 * ```typescript
 * // Use default schema
 * const quotas = await getWorkspaceQuotas(client, { teamSlug: 'team-slug' })
 *
 * // Return raw data without validation
 * const raw = await getWorkspaceQuotas(client, { teamSlug: 'team-slug' }, { schema: false })
 *
 * // Use custom schema
 * const customSchema = z.object({ tier: z.string() })
 * const custom = await getWorkspaceQuotas(client, { teamSlug: 'team-slug' }, { schema: customSchema })
 * ```
 *
 * ## Quota Convention
 *
 * - `limit = -1` means unlimited (e.g., enterprise tier)
 * - `remaining = -1` means unlimited
 *
 * ## Safe Version
 *
 * Use `safeGetWorkspaceQuotas` for error handling without exceptions:
 *
 * ```typescript
 * import { safeGetWorkspaceQuotas } from '@phala/cloud'
 *
 * const result = await safeGetWorkspaceQuotas(client, { teamSlug: 'team-slug' })
 * if (result.success) {
 *   console.log(`Tier: ${result.data.tier}`)
 *   console.log(`VM Slots: ${result.data.quotas.vm_slots.remaining}/${result.data.quotas.vm_slots.limit}`)
 *   if (result.data.reserved_nodes.limit === -1) {
 *     console.log('Unlimited reserved nodes')
 *   } else {
 *     console.log(`Reserved Nodes: ${result.data.reserved_nodes.remaining}/${result.data.reserved_nodes.limit}`)
 *   }
 * } else {
 *   if ("isRequestError" in result.error) {
 *     console.error(`HTTP ${result.error.status}: ${result.error.message}`)
 *   } else {
 *     console.error(`Validation error: ${result.error.issues}`)
 *   }
 * }
 * ```
 */

export const QuotaMetricSchema = z
  .object({
    limit: z.number(),
    remaining: z.number(),
  })
  .passthrough();

export const WorkspaceQuotasSchema = z
  .object({
    vm_slots: QuotaMetricSchema,
    vcpu: QuotaMetricSchema,
    memory_mb: QuotaMetricSchema,
    disk_gb: QuotaMetricSchema,
  })
  .passthrough();

export const WorkspaceReservedGpuQuotaSchema = z
  .object({
    gpus: QuotaMetricSchema,
    in_use: z.number(),
    misconfigured: z.number(),
  })
  .passthrough();

export const GetWorkspaceQuotasSchema = z
  .object({
    team_slug: z.string(),
    tier: z.string(),
    quotas: WorkspaceQuotasSchema,
    reserved_nodes: QuotaMetricSchema,
    reserved_gpu: WorkspaceReservedGpuQuotaSchema,
    as_of: z.string(),
  })
  .passthrough();

export type QuotaMetric = z.infer<typeof QuotaMetricSchema>;
export type WorkspaceQuotas = z.infer<typeof WorkspaceQuotasSchema>;
export type WorkspaceReservedGpuQuota = z.infer<typeof WorkspaceReservedGpuQuotaSchema>;
export type GetWorkspaceQuotas = z.infer<typeof GetWorkspaceQuotasSchema>;

export type GetWorkspaceQuotasRequest = {
  teamSlug: string;
};

const { action: getWorkspaceQuotas, safeAction: safeGetWorkspaceQuotas } = defineAction<
  GetWorkspaceQuotasRequest,
  typeof GetWorkspaceQuotasSchema
>(GetWorkspaceQuotasSchema, async (client, request) => {
  return await client.get(`/workspaces/${request.teamSlug}/quotas`);
});

export { getWorkspaceQuotas, safeGetWorkspaceQuotas };
