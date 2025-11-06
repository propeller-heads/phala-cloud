import { z } from "zod";
import { type Client } from "../../client";
import { defineAction } from "../../utils/define-action";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";

/**
 * CVM state response schema
 */
export const CvmStateSchema = z.object({
  status: z.string(),
  derived_status: z.string().optional(),
  vm_uuid: z.string().optional(),
  instance_id: z.string().optional(),
  uptime: z.string().optional(),
  // Add other state fields as needed
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
