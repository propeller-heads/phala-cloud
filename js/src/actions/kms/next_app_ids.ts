import { z } from "zod";
import { type Client } from "../../client";
import { defineAction } from "../../utils/define-action";

export const NextAppIdsRequestSchema = z
  .object({
    counts: z.number().int().min(1).max(20).optional().default(1),
  })
  .strict();

export const NextAppIdsSchema = z
  .object({
    app_ids: z.array(
      z.object({
        app_id: z.string(),
        nonce: z.number().int().min(0),
      }),
    ),
  })
  .strict();

export type NextAppIdsRequest = z.infer<typeof NextAppIdsRequestSchema>;

export type NextAppIds = z.infer<typeof NextAppIdsSchema>;

const { action: nextAppIds, safeAction: safeNextAppIds } = defineAction<
  NextAppIdsRequest,
  typeof NextAppIdsSchema
>(NextAppIdsSchema, async (client, payload) => {
  const validatedRequest = NextAppIdsRequestSchema.parse(payload ?? {});
  const params = new URLSearchParams();
  params.append("counts", validatedRequest.counts.toString());
  return await client.get(`/kms/phala/next_app_id?${params.toString()}`);
});

export { nextAppIds, safeNextAppIds };
