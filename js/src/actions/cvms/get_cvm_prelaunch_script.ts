import { z } from "zod";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";

export const GetCvmPreLaunchScriptRequestSchema = CvmIdSchema;

export type GetCvmPreLaunchScriptRequest = CvmIdInput;

const { action: getCvmPreLaunchScript, safeAction: safeGetCvmPreLaunchScript } = defineAction<
  GetCvmPreLaunchScriptRequest,
  z.ZodString
>(z.string(), async (client, request) => {
  const { cvmId } = GetCvmPreLaunchScriptRequestSchema.parse(request);
  return await client.get(`/cvms/${cvmId}/pre-launch-script`);
});

export { getCvmPreLaunchScript, safeGetCvmPreLaunchScript };
