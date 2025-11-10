import { z } from "zod";
import { type Client } from "../../client";
import { defineAction } from "../../utils/define-action";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";

/**
 * CVM state response schema
 */
export const CvmStateSchema = z.object({
  id: z.string().optional(),
  instance_id: z.string().optional(),
  name: z.string(),
  status: z.string(),
  uptime: z.string().optional(),
  exited_at: z.string().optional(),
  boot_progress: z.string().optional(),
  boot_error: z.string().optional(),
  shutdown_progress: z.string().optional(),
});

export type CvmState = z.infer<typeof CvmStateSchema>;

export const GetCvmStateRequestSchema = CvmIdSchema;

export type GetCvmStateRequest = CvmIdInput;

/**
 * Get current state of a CVM (one-shot, immediate return)
 *
 * This action retrieves the current state of a CVM without waiting or streaming.
 * For monitoring state changes until a target status is reached, use `watchCvmState` instead.
 *
 * @param client - The API client
 * @param request - Request parameters
 * @param request.cvmId - ID of the CVM to get state for
 * @param parameters - Optional behavior parameters
 * @returns Current CVM state
 *
 * @example
 * ```typescript
 * const state = await getCvmState(client, { cvmId: "cvm-123" })
 * console.log(state.status) // "running", "stopped", etc.
 * ```
 */
const { action: getCvmState, safeAction: safeGetCvmState } = defineAction<
  GetCvmStateRequest,
  typeof CvmStateSchema,
  CvmState
>(CvmStateSchema, async (client, request) => {
  const { cvmId } = GetCvmStateRequestSchema.parse(request);
  // No target parameter = immediate mode
  return await client.get(`/cvms/${cvmId}/state`);
});

export { getCvmState, safeGetCvmState };
