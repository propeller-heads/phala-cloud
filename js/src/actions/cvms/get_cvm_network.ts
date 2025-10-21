import { z } from "zod";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";

const CvmNetworkUrlsSchema = z.object({
  app: z.string(),
  instance: z.string(),
});

export const CvmNetworkSchema = z.object({
  is_online: z.boolean(),
  is_public: z.boolean().default(true),
  error: z.string().nullable(),
  internal_ip: z.string().nullable(),
  latest_handshake: z.string().nullable(),
  public_urls: z.array(CvmNetworkUrlsSchema).nullable(),
});

export type CvmNetwork = z.infer<typeof CvmNetworkSchema>;

export const GetCvmNetworkRequestSchema = CvmIdSchema;

export type GetCvmNetworkRequest = CvmIdInput;

const { action: getCvmNetwork, safeAction: safeGetCvmNetwork } = defineAction<
  GetCvmNetworkRequest,
  typeof CvmNetworkSchema
>(CvmNetworkSchema, async (client, request) => {
  const { cvmId } = GetCvmNetworkRequestSchema.parse(request);
  return await client.get(`/cvms/${cvmId}/network`);
});

export { getCvmNetwork, safeGetCvmNetwork };
