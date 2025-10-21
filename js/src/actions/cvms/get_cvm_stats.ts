import { z } from "zod";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";

/**
 * Get CVM system statistics and information
 *
 * This action retrieves detailed system information including CPU, memory,
 * disk usage, and boot status of a CVM instance.
 *
 * @example
 * ```typescript
 * import { createClient, getCvmStats } from '@phala/cloud'
 *
 * const client = createClient();
 * const stats = await getCvmStats(client, { id: 'my-cvm-id' });
 * console.log(stats.sysinfo?.cpu_model);
 * ```
 *
 * ## Safe Version
 *
 * Use `safeGetCvmStats` for error handling without exceptions:
 *
 * ```typescript
 * const result = await safeGetCvmStats(client, { id: 'my-cvm-id' });
 * if (result.success) {
 *   console.log('CPU usage:', result.data.sysinfo?.used_memory);
 * } else {
 *   console.error('Failed to get stats:', result.error.message);
 * }
 * ```
 */

const DiskInfoSchema = z.object({
  name: z.string(),
  mount_point: z.string(),
  total_size: z.number(),
  free_size: z.number(),
});

const SystemInfoSchema = z.object({
  os_name: z.string(),
  os_version: z.string(),
  kernel_version: z.string(),
  cpu_model: z.string(),
  num_cpus: z.number(),
  total_memory: z.number(),
  available_memory: z.number(),
  used_memory: z.number(),
  free_memory: z.number(),
  total_swap: z.number(),
  used_swap: z.number(),
  free_swap: z.number(),
  uptime: z.number(),
  loadavg_one: z.number(),
  loadavg_five: z.number(),
  loadavg_fifteen: z.number(),
  disks: z.array(DiskInfoSchema),
});

export const CvmSystemInfoSchema = z.object({
  is_online: z.boolean(),
  is_public: z.boolean().default(false),
  error: z.string().nullable(),
  sysinfo: SystemInfoSchema.nullable(),
  status: z.string().nullable(),
  in_progress: z.boolean().default(false),
  boot_progress: z.string().nullable(),
  boot_error: z.string().nullable(),
});

export type CvmSystemInfo = z.infer<typeof CvmSystemInfoSchema>;

export const GetCvmStatsRequestSchema = CvmIdSchema;

export type GetCvmStatsRequest = CvmIdInput;

const { action: getCvmStats, safeAction: safeGetCvmStats } = defineAction<
  GetCvmStatsRequest,
  typeof CvmSystemInfoSchema
>(CvmSystemInfoSchema, async (client, request) => {
  const { cvmId } = GetCvmStatsRequestSchema.parse(request);
  return await client.get(`/cvms/${cvmId}/stats`);
});

export { getCvmStats, safeGetCvmStats };
