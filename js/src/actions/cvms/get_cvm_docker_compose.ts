import { z } from "zod";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";

export const GetCvmDockerComposeRequestSchema = CvmIdSchema;

export type GetCvmDockerComposeRequest = CvmIdInput;

const { action: getCvmDockerCompose, safeAction: safeGetCvmDockerCompose } = defineAction<
  GetCvmDockerComposeRequest,
  z.ZodString
>(z.string(), async (client, request) => {
  const { cvmId } = GetCvmDockerComposeRequestSchema.parse(request);
  return await client.get(`/cvms/${cvmId}/docker-compose.yml`);
});

export { getCvmDockerCompose, safeGetCvmDockerCompose };
